from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from app.database import get_db
from app.middleware.auth_middleware import get_current_teacher
from app.services.storage_service import upload_file
import httpx
from app.config import settings

from app.models.user import User, TeacherProfile
from app.models.course import Course, Lesson
from app.models.enrollment import Enrollment
from app.models.payment import Payment, Payout
from app.models.risk import StudentRiskScore
from app.models.progress import StudentProgress
from app.services.notification_service import create_notification


class TeacherProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    expertise_areas: Optional[List[str]] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    payout_bank_account: Optional[str] = None  # alias for bank_account_number
    payout_ifsc: Optional[str] = None           # alias for bank_ifsc


router = APIRouter(prefix="/teacher", tags=["Teacher"])


class OnboardingBody(BaseModel):
    legal_name: Optional[str] = None
    years_teaching: Optional[int] = None
    past_employers: Optional[List[str]] = None
    highest_degree: Optional[str] = None


@router.get("/onboarding/status")
async def onboarding_status(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "onboarding_status": profile.onboarding_status,
        "legal_name": profile.legal_name,
        "years_teaching": profile.years_teaching,
        "past_employers": profile.past_employers or [],
        "highest_degree": profile.highest_degree,
        "degree_proof_url": profile.degree_proof_url,
        "aadhaar_doc_url": profile.aadhaar_doc_url,
        "pan_doc_url": profile.pan_doc_url,
        "rejection_reason": profile.rejection_reason,
        "submitted_at": profile.onboarding_submitted_at.isoformat() if profile.onboarding_submitted_at else None,
    }


@router.patch("/onboarding")
async def save_onboarding_draft(
    data: OnboardingBody,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if profile.onboarding_status in ("submitted", "approved"):
        raise HTTPException(status_code=400, detail="Onboarding already submitted or approved")
    if data.legal_name is not None:
        profile.legal_name = data.legal_name
    if data.years_teaching is not None:
        profile.years_teaching = data.years_teaching
    if data.past_employers is not None:
        profile.past_employers = data.past_employers
    if data.highest_degree is not None:
        profile.highest_degree = data.highest_degree
    if profile.onboarding_status == "rejected":
        profile.onboarding_status = "draft"
    db.commit()
    return {"message": "Saved", "onboarding_status": profile.onboarding_status}


@router.post("/onboarding/upload")
async def onboarding_upload_document(
    doc_type: str = Form(...),  # degree_proof | aadhaar | pan
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    if doc_type not in ("degree_proof", "aadhaar", "pan"):
        raise HTTPException(status_code=400, detail="Invalid doc_type")
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if profile.onboarding_status in ("submitted", "approved"):
        raise HTTPException(status_code=400, detail="Cannot upload after submit")
    content = await file.read()
    key = f"teacher-kyc/{current_user.id}/{doc_type}/{uuid.uuid4().hex}_{file.filename}"
    url = upload_file(content, "course-materials", key, file.content_type or "application/octet-stream")
    if doc_type == "degree_proof":
        profile.degree_proof_url = url
    elif doc_type == "aadhaar":
        profile.aadhaar_doc_url = url
    else:
        profile.pan_doc_url = url
    db.commit()
    return {"url": url, "doc_type": doc_type}


@router.post("/onboarding/submit")
async def submit_onboarding(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if profile.onboarding_status in ("submitted", "approved"):
        raise HTTPException(status_code=400, detail="Already submitted or approved")
    if not profile.legal_name or not profile.highest_degree:
        raise HTTPException(status_code=400, detail="legal_name and highest_degree are required")
    if not profile.aadhaar_doc_url or not profile.pan_doc_url:
        raise HTTPException(status_code=400, detail="Aadhaar and PAN documents are required")
    profile.onboarding_status = "submitted"
    profile.onboarding_submitted_at = datetime.now(timezone.utc)
    profile.rejection_reason = None
    db.commit()
    return {"message": "Submitted for review", "onboarding_status": "submitted"}


@router.get("/dashboard")
async def teacher_dashboard(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).filter(Course.teacher_id == current_user.id).all()
    course_ids = [c.id for c in courses]

    total_revenue = db.query(func.sum(Payment.total_amount)).filter(
        Payment.payee_id == current_user.id,
        Payment.status == "completed"
    ).scalar() or 0

    platform_cut = db.query(func.sum(Payment.platform_cut)).filter(
        Payment.payee_id == current_user.id,
        Payment.status == "completed"
    ).scalar() or 0

    my_earnings = float(total_revenue) - float(platform_cut)

    total_students = db.query(func.count(Enrollment.id)).filter(
        Enrollment.course_id.in_(course_ids),
        Enrollment.is_active == True
    ).scalar() or 0

    at_risk = db.query(StudentRiskScore).filter(
        StudentRiskScore.course_id.in_(course_ids),
        StudentRiskScore.risk_level == "high"
    ).limit(10).all()

    at_risk_list = []
    for r in at_risk:
        student = db.query(User).filter(User.id == r.student_id).first()
        course = db.query(Course).filter(Course.id == r.course_id).first()
        at_risk_list.append({
            "student_id": str(r.student_id),
            "student_name": student.full_name if student else "Unknown",
            "course_id": str(r.course_id),
            "course_title": course.title if course else "Unknown",
            "risk_level": r.risk_level,
            "risk_score": float(r.risk_score) if r.risk_score else 0
        })

    recent_enrollments = db.query(Enrollment).filter(
        Enrollment.course_id.in_(course_ids)
    ).order_by(Enrollment.enrolled_at.desc()).limit(10).all()

    recent_list = []
    for e in recent_enrollments:
        student = db.query(User).filter(User.id == e.student_id).first()
        course = db.query(Course).filter(Course.id == e.course_id).first()
        recent_list.append({
            "student_name": student.full_name if student else "Unknown",
            "course_title": course.title if course else "Unknown",
            "enrolled_at": e.enrolled_at.isoformat()
        })

    active_courses = sum(1 for c in courses if c.status == "published")

    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()

    return {
        "total_revenue": float(total_revenue),
        "platform_cut": float(platform_cut),
        "my_earnings": my_earnings,
        "total_students": total_students,
        "active_courses": active_courses,
        "pending_payout": float(profile.pending_payout) if profile else 0,
        "avg_completion_rate": float(profile.avg_completion_rate) if profile else 0,
        "recent_enrollments": recent_list,
        "at_risk_students": at_risk_list
    }


@router.get("/courses/{course_id}/students")
async def get_course_students(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id,
        Enrollment.is_active == True
    ).all()

    students = []
    for e in enrollments:
        student = db.query(User).filter(User.id == e.student_id).first()
        if not student:
            continue

        # Get risk score
        risk = db.query(StudentRiskScore).filter(
            StudentRiskScore.student_id == e.student_id,
            StudentRiskScore.course_id == course_id
        ).first()

        # Get progress
        progress_records = db.query(StudentProgress).filter(
            StudentProgress.student_id == e.student_id,
            StudentProgress.course_id == course_id
        ).all()
        completed = sum(1 for p in progress_records if p.completed)
        total_lessons = db.query(func.count()).filter(
            StudentProgress.course_id == course_id
        ).scalar() or 1

        last_active = max((p.last_watched_at for p in progress_records if p.last_watched_at), default=None)

        students.append({
            "student_id": str(student.id),
            "name": student.full_name,
            "email": student.email,
            "avatar_url": student.avatar_url,
            "progress_percent": round(completed / total_lessons * 100) if total_lessons else 0,
            "last_active": last_active.isoformat() if last_active else None,
            "risk_level": risk.risk_level if risk else "low",
            "enrolled_at": e.enrolled_at.isoformat()
        })

    return {"students": students}


@router.post("/courses/{course_id}/students/{student_id}/nudge")
async def nudge_student(
    course_id: str,
    student_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    create_notification(
        db, student_id, "teacher_encouragement",
        f"Message from {current_user.full_name}",
        f"Your teacher is rooting for you! Keep going with {course.title}. You're doing great!",
        {"course_id": course_id}
    )

    # Send email
    from tasks.email_tasks import send_nudge_email_task
    send_nudge_email_task.delay(
        student.email, student.full_name,
        current_user.full_name, course.title
    )

    return {"message": "Encouragement sent"}


@router.get("/earnings")
async def get_teacher_earnings(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()

    payments = db.query(Payment).filter(
        Payment.payee_id == current_user.id,
        Payment.status == "completed"
    ).order_by(Payment.created_at.desc()).all()

    payouts = db.query(Payout).filter(
        Payout.teacher_id == current_user.id
    ).order_by(Payout.initiated_at.desc()).all()

    total = sum(float(p.teacher_earning or 0) for p in payments)
    platform = sum(float(p.platform_cut or 0) for p in payments)

    transactions = []
    for p in payments[:50]:
        transactions.append({
            "date": p.created_at.isoformat(),
            "payment_type": p.payment_type,
            "gross": float(p.total_amount or 0),
            "platform_cut": float(p.platform_cut or 0),
            "your_earning": float(p.teacher_earning or 0),
            "currency": p.currency
        })

    return {
        "total_earned_alltime": total,
        "platform_cut_alltime": platform,
        "net_earned_alltime": total - platform,
        "pending_payout": float(profile.pending_payout) if profile else 0,
        "paid_out_alltime": float(profile.total_paid_out) if profile else 0,
        "transactions": transactions,
        "payouts": [
            {
                "id": str(p.id),
                "amount": float(p.amount or 0),
                "status": p.status,
                "initiated_at": p.initiated_at.isoformat(),
                "completed_at": p.completed_at.isoformat() if p.completed_at else None
            }
            for p in payouts
        ]
    }


@router.get("/courses")
async def get_teacher_courses(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    from app.schemas.course import CourseResponse
    courses = db.query(Course).filter(Course.teacher_id == current_user.id).order_by(Course.created_at.desc()).all()
    return [CourseResponse.from_orm(c) for c in courses]


@router.get("/courses/{course_id}")
async def get_teacher_course(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    from app.schemas.course import CourseResponse
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseResponse.from_orm(course)


@router.patch("/profile")
async def update_teacher_profile(
    data: TeacherProfileUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if data.bio is not None:
        profile.bio = data.bio
    if data.bank_account_name:
        profile.bank_account_name = data.bank_account_name
    # Accept legacy field aliases from frontend
    if data.bank_account_number:
        profile.bank_account_number = data.bank_account_number
    if data.payout_bank_account:
        profile.bank_account_number = data.payout_bank_account
    if data.bank_ifsc:
        profile.bank_ifsc = data.bank_ifsc
    if data.payout_ifsc:
        profile.bank_ifsc = data.payout_ifsc
    if data.full_name:
        current_user.full_name = data.full_name

    db.commit()
    return {"message": "Profile updated"}


@router.get("/analytics")
async def teacher_analytics(
    course_id: str = None,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    from app.models.enrollment import Enrollment
    from app.models.payment import Payment
    from app.models.quiz import QuizAttempt, Quiz
    from app.models.progress import StudentProgress
    from sqlalchemy import func

    q = db.query(Course).filter(Course.teacher_id == current_user.id)
    if course_id:
        q = q.filter(Course.id == course_id)
    courses = q.all()
    out = []
    for c in courses:
        enrolls = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
        revenue = (
            db.query(func.sum(Payment.total_amount))
            .filter(
                Payment.reference_id == c.id,
                Payment.payment_type == "course_purchase",
                Payment.status == "completed",
            )
            .scalar()
            or 0
        )
        completed = (
            db.query(func.count(StudentProgress.id))
            .filter(StudentProgress.course_id == c.id, StudentProgress.completed == True)
            .scalar()
            or 0
        )
        quizzes = db.query(Quiz).filter(Quiz.course_id == c.id).all()
        scores = []
        for qz in quizzes:
            avg = (
                db.query(func.avg(QuizAttempt.score_percent))
                .filter(QuizAttempt.quiz_id == qz.id)
                .scalar()
            )
            if avg is not None:
                scores.append(float(avg))
        out.append(
            {
                "course_id": str(c.id),
                "title": c.title,
                "enrollments": int(enrolls),
                "revenue": float(revenue),
                "lesson_completions": int(completed),
                "avg_quiz_score": sum(scores) / len(scores) if scores else None,
            }
        )
    return {"courses": out}


@router.post("/courses/{course_id}/thumbnails/regenerate")
async def regenerate_thumbnail(
    course_id: str,
    lesson_id: str = Query(None),
    custom_prompt: str = Query(None),
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    face_url = current_user.avatar_url
    payload = {
        "title": course.title,
        "category": course.category or "Education",
        "description": course.description or "",
        "faculty_face_image_url": face_url,
        "custom_prompt": custom_prompt,
    }
    if lesson_id:
        les = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
        if not les:
            raise HTTPException(status_code=404, detail="Lesson not found")
        ch = les.chapter
        payload["lesson_title"] = les.title
        payload["module_title"] = ch.title if ch else ""
        payload["description"] = les.ai_summary or les.title
    try:
        r = httpx.post(
            f"{settings.ai_service_url}/generate-thumbnail",
            json=payload,
            timeout=120,
        )
        if r.status_code != 200:
            raise HTTPException(status_code=500, detail=r.text)
        url = r.json().get("thumbnail_url")
        if lesson_id:
            les.thumbnail_url = url
        else:
            course.thumbnail_url = url
        db.commit()
        return {"thumbnail_url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
