from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import get_db
from app.middleware.auth_middleware import get_current_admin
from app.models.user import User, TeacherProfile
from app.models.course import Course
from app.models.payment import Payment, Payout, RefundRequest
from app.models.enrollment import Enrollment
from app.services.payment_service import process_refund
from app.services.notification_service import create_notification
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar()
    total_students = db.query(func.count(User.id)).filter(User.role == "student").scalar()
    total_teachers = db.query(func.count(User.id)).filter(User.role == "teacher").scalar()
    total_courses = db.query(func.count(Course.id)).filter(Course.status == "published").scalar()

    total_revenue = db.query(func.sum(Payment.total_amount)).filter(Payment.status == "completed").scalar() or 0
    platform_cut = db.query(func.sum(Payment.platform_cut)).filter(Payment.status == "completed").scalar() or 0
    total_enrollments = db.query(func.count(Enrollment.id)).scalar()

    # Pending verifications
    pending_verifications = db.query(TeacherProfile).filter(
        TeacherProfile.identity_verified == False
    ).count()

    top_courses = db.query(Course).filter(Course.status == "published").order_by(
        Course.enrolled_count.desc()
    ).limit(5).all()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": float(total_revenue),
        "platform_revenue": float(platform_cut),
        "pending_verifications": pending_verifications,
        "top_courses": [
            {
                "id": str(c.id),
                "title": c.title,
                "enrolled_count": c.enrolled_count,
                "avg_rating": float(c.avg_rating)
            }
            for c in top_courses
        ]
    }


@router.get("/teachers")
async def get_all_teachers(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    teachers = db.query(User).filter(User.role == "teacher").all()
    result = []
    for t in teachers:
        profile = t.teacher_profile
        result.append({
            "id": str(t.id),
            "email": t.email,
            "full_name": t.full_name,
            "created_at": t.created_at.isoformat(),
            "identity_verified": profile.identity_verified if profile else False,
            "expert_verified": profile.expert_verified if profile else False,
            "credibility_score": float(profile.credibility_score) if profile else 0,
            "total_students": profile.total_students if profile else 0,
            "pending_payout": float(profile.pending_payout) if profile else 0
        })
    return {"teachers": result}


@router.get("/teachers/pending-verification")
async def pending_verifications(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    profiles = db.query(TeacherProfile).filter(
        or_(TeacherProfile.identity_verified == False, TeacherProfile.onboarding_status == "submitted")
    ).all()
    result = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        result.append({
            "teacher_id": str(p.user_id),
            "full_name": user.full_name if user else "Unknown",
            "email": user.email if user else "",
            "verification_documents": p.verification_documents,
            "onboarding_status": p.onboarding_status,
            "legal_name": p.legal_name,
            "years_teaching": p.years_teaching,
            "past_employers": p.past_employers,
            "highest_degree": p.highest_degree,
            "degree_proof_url": p.degree_proof_url,
            "aadhaar_doc_url": p.aadhaar_doc_url,
            "pan_doc_url": p.pan_doc_url,
            "created_at": p.created_at.isoformat()
        })
    return {"pending": result}


@router.patch("/teachers/{teacher_id}/verify")
async def verify_teacher(
    teacher_id: str,
    identity_verified: bool = False,
    expert_verified: bool = False,
    outcome_verified: bool = False,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == teacher_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    profile.identity_verified = identity_verified
    profile.expert_verified = expert_verified
    profile.outcome_verified = outcome_verified
    if identity_verified and profile.onboarding_status == "submitted":
        profile.onboarding_status = "approved"
        profile.onboarding_reviewed_at = datetime.utcnow()
        profile.rejection_reason = None

    user = db.query(User).filter(User.id == teacher_id).first()
    if user:
        user.is_verified = identity_verified

    db.commit()

    create_notification(
        db, teacher_id, "verification_update",
        "Verification Status Updated",
        f"Your verification status has been updated. Identity: {'Verified' if identity_verified else 'Pending'}",
        {}
    )

    return {"message": "Teacher verified"}


@router.patch("/teachers/{teacher_id}/onboarding")
async def review_onboarding(
    teacher_id: str,
    action: str = Query(...),  # approve | reject
    reason: str = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == teacher_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    if action == "approve":
        profile.onboarding_status = "approved"
        profile.identity_verified = True
        profile.onboarding_reviewed_at = datetime.utcnow()
        profile.rejection_reason = None
    elif action == "reject":
        profile.onboarding_status = "rejected"
        profile.rejection_reason = reason or "Please update your application."
        profile.onboarding_reviewed_at = datetime.utcnow()
    else:
        raise HTTPException(status_code=400, detail="action must be approve or reject")
    db.commit()
    create_notification(
        db, teacher_id, "onboarding_update",
        "Onboarding update",
        "Your teacher application was approved. You can create courses."
        if action == "approve"
        else f"Application needs attention: {profile.rejection_reason}",
        {},
    )
    return {"message": "ok", "onboarding_status": profile.onboarding_status}


@router.patch("/courses/{course_id}/moderation")
async def admin_course_moderation(
    course_id: str,
    moderation_status: str = Query(...),  # approved | rejected
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if moderation_status == "approved":
        course.moderation_status = "approved"
        course.content_validation_status = "approved"
    elif moderation_status == "rejected":
        course.moderation_status = "rejected"
        course.content_validation_status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    return {"message": "updated"}


@router.get("/courses")
async def get_all_courses(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    return {
        "courses": [
            {
                "id": str(c.id),
                "title": c.title,
                "status": c.status,
                "teacher_id": str(c.teacher_id),
                "price": float(c.price),
                "enrolled_count": c.enrolled_count,
                "is_featured": c.is_featured,
                "created_at": c.created_at.isoformat(),
                "moderation_status": getattr(c, "moderation_status", None),
                "content_validation_status": getattr(c, "content_validation_status", None),
                "ai_processing_status": c.ai_processing_status,
            }
            for c in courses
        ]
    }


@router.patch("/courses/{course_id}/feature")
async def feature_course(
    course_id: str,
    featured: bool = True,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_featured = featured
    db.commit()
    return {"message": f"Course {'featured' if featured else 'unfeatured'}"}


@router.get("/payments")
async def get_all_payments(
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total = db.query(func.count(Payment.id)).scalar()
    payments = db.query(Payment).order_by(Payment.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "payments": [
            {
                "id": str(p.id),
                "payment_type": p.payment_type,
                "total_amount": float(p.total_amount or 0),
                "platform_cut": float(p.platform_cut or 0),
                "teacher_earning": float(p.teacher_earning or 0),
                "status": p.status,
                "created_at": p.created_at.isoformat()
            }
            for p in payments
        ]
    }


@router.post("/payouts/process")
async def process_payouts(
    teacher_id: str = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Trigger payout to specific teacher or all teachers with pending balance."""
    from tasks.email_tasks import send_payout_notification_task

    if teacher_id:
        teachers = [db.query(User).filter(User.id == teacher_id).first()]
    else:
        profiles = db.query(TeacherProfile).filter(TeacherProfile.pending_payout >= 100).all()
        teachers = [db.query(User).filter(User.id == p.user_id).first() for p in profiles]

    processed = []
    for teacher in teachers:
        if not teacher:
            continue
        profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == teacher.id).first()
        if not profile or float(profile.pending_payout) < 100:
            continue

        amount = float(profile.pending_payout)

        payout = Payout(
            teacher_id=teacher.id,
            amount=amount,
            status="processing",
            initiated_by=current_user.id
        )
        db.add(payout)

        profile.total_paid_out = float(profile.total_paid_out or 0) + amount
        profile.pending_payout = 0

        create_notification(
            db, str(teacher.id), "payout_processed",
            f"Payout of ₹{amount:.2f} Processed",
            f"Your earnings of ₹{amount:.2f} have been processed",
            {}
        )
        send_payout_notification_task.delay(teacher.email, teacher.full_name, amount)
        processed.append({"teacher_id": str(teacher.id), "amount": amount})

    db.commit()
    return {"processed": processed, "count": len(processed)}


@router.get("/refunds")
async def get_refund_requests(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    refunds = db.query(RefundRequest).filter(RefundRequest.status == "pending").all()
    result = []
    for r in refunds:
        student = db.query(User).filter(User.id == r.student_id).first()
        enrollment = r.enrollment
        course_title = enrollment.course.title if enrollment and enrollment.course else "Unknown"
        result.append({
            "id": str(r.id),
            "student_name": student.full_name if student else "Unknown",
            "course_name": course_title,
            "reason": r.reason,
            "watch_percent": float(r.watch_percent_at_request) if r.watch_percent_at_request else 0,
            "requested_at": r.requested_at.isoformat()
        })
    return {"refunds": result}


@router.patch("/refunds/{refund_id}/approve")
async def approve_refund(
    refund_id: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    refund = db.query(RefundRequest).filter(RefundRequest.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund request not found")

    payment = db.query(Payment).filter(Payment.id == refund.payment_id).first()
    if payment:
        process_refund(payment.razorpay_payment_id, float(payment.total_amount))
        payment.status = "refunded"

    if refund.enrollment:
        refund.enrollment.is_active = False

    refund.status = "approved"
    refund.resolved_at = datetime.utcnow()
    db.commit()

    create_notification(
        db, str(refund.student_id), "refund_approved",
        "Refund Approved",
        "Your refund request has been approved. Amount will be credited within 5-7 business days.",
        {}
    )
    return {"message": "Refund approved"}


@router.patch("/refunds/{refund_id}/reject")
async def reject_refund(
    refund_id: str,
    admin_note: str = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    refund = db.query(RefundRequest).filter(RefundRequest.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund request not found")

    refund.status = "rejected"
    refund.admin_note = admin_note
    refund.resolved_at = datetime.utcnow()
    db.commit()

    create_notification(
        db, str(refund.student_id), "refund_rejected",
        "Refund Request Rejected",
        f"Your refund request was rejected. Reason: {admin_note or 'Does not meet refund policy'}",
        {}
    )
    return {"message": "Refund rejected"}
