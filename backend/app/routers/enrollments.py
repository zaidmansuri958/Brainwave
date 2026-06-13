from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.community import CommunityPost
from app.models.payment import Payment
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.services.payment_service import create_razorpay_order, verify_razorpay_signature, create_pending_payment, finalize_payment
from app.services.notification_service import create_notification
from app.schemas.payment import EnrollmentInitiate, EnrollmentConfirm
from app.utils.pricing import effective_course_price, enrollment_access_fields
import uuid

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.post("/initiate")
async def initiate_enrollment(
    data: EnrollmentInitiate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == data.course_id, Course.status == "published").first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == data.course_id
    ).first()
    if existing and existing.is_active:
        raise HTTPException(status_code=400, detail="Already enrolled")

    eff = effective_course_price(db, course)

    # Free course — enroll directly
    if eff == 0:
        af = enrollment_access_fields(course)
        enrollment = Enrollment(
            student_id=current_user.id,
            course_id=data.course_id,
            amount_paid=0,
            **af,
        )
        db.add(enrollment)
        course.enrolled_count += 1
        db.commit()
        # Notify teacher
        create_notification(
            db, str(course.teacher_id), "new_enrollment",
            "New Student Enrolled",
            f"{current_user.full_name} enrolled in {course.title}",
            {"course_id": str(data.course_id), "student_id": str(current_user.id)}
        )
        return {"free": True, "enrolled": True}

    order = create_razorpay_order(eff)
    create_pending_payment(
        db,
        payer_id=str(current_user.id),
        payee_id=str(course.teacher_id),
        payment_type="course_purchase",
        reference_id=str(data.course_id),
        razorpay_order_id=order["id"],
        total_amount=float(eff),
        currency=course.currency,
    )
    return {
        "razorpay_order_id": order["id"],
        "amount": eff,
        "currency": course.currency,
        "course_title": course.title
    }


@router.post("/confirm")
async def confirm_enrollment(
    data: EnrollmentConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_razorpay_signature(data.razorpay_payment_id, data.razorpay_order_id, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # Validate against the order created at /initiate (amount, payee and course are read from
    # the stored order — never trusted from the client) and credit the teacher exactly once.
    payment = finalize_payment(
        db,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        payer_id=str(current_user.id),
        reference_id=str(data.course_id),
    )

    course = db.query(Course).filter(Course.id == payment.reference_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Idempotency: a replayed confirm must not create a second enrollment.
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course.id,
    ).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            db.commit()
        return {"enrolled": True, "enrollment_id": str(existing.id)}

    eff = float(payment.total_amount or 0)
    af = enrollment_access_fields(course)
    enrollment = Enrollment(
        student_id=current_user.id,
        course_id=course.id,
        payment_id=payment.id,
        amount_paid=eff,
        **af,
    )
    db.add(enrollment)
    course.enrolled_count += 1
    db.commit()
    db.refresh(enrollment)

    # Send notifications
    create_notification(
        db, str(course.teacher_id), "new_enrollment",
        "New Student Enrolled",
        f"{current_user.full_name} enrolled in {course.title}",
        {"course_id": str(data.course_id), "student_id": str(current_user.id)}
    )

    # Send email
    from tasks.email_tasks import send_enrollment_email_task
    send_enrollment_email_task.delay(current_user.full_name, current_user.email, course.title)

    return {"enrollment": {"id": str(enrollment.id), "course_id": str(data.course_id)}, "success": True}


@router.get("/my-courses")
async def get_my_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.schemas.course import CourseResponse
    from app.models.progress import StudentProgress
    from app.models.course import Lesson, Chapter
    from sqlalchemy import func

    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.is_active == True
    ).all()

    courses = []
    for e in enrollments:
        # Count total lessons in this course
        total_lessons = db.query(func.count(Lesson.id)).join(
            Chapter, Lesson.chapter_id == Chapter.id
        ).filter(Chapter.course_id == e.course_id).scalar() or 0

        # Count completed lessons for this student
        completed_lessons = db.query(func.count(StudentProgress.id)).filter(
            StudentProgress.student_id == current_user.id,
            StudentProgress.course_id == e.course_id,
            StudentProgress.completed == True
        ).scalar() or 0

        progress = round(completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

        courses.append({
            "enrollment_id": str(e.id),
            "enrolled_at": e.enrolled_at.isoformat(),
            "progress": progress,
            "course": CourseResponse.from_orm(e.course)
        })

    return {"courses": courses}


@router.get("/check/{course_id}")
async def check_enrollment(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.is_active == True
    ).first()
    return {"enrolled": enrollment is not None}


@router.delete("/{enrollment_id}")
async def cancel_enrollment(
    enrollment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.middleware.auth_middleware import get_current_user as _get_current_user
    # Allow admin or the enrolled student to cancel
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if current_user.role not in ("admin",) and str(enrollment.student_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    enrollment.is_active = False
    db.commit()
    return {"message": "Enrollment cancelled"}
