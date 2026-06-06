from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.progress import StudentProgress
from app.models.course import Lesson, Chapter
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from sqlalchemy import func

router = APIRouter(prefix="/certificates", tags=["Certificates"])


def _serialize_cert(cert: Certificate) -> dict:
    return {
        "id": str(cert.id),
        "course_id": str(cert.course_id) if cert.course_id else None,
        "course_name": cert.course.title if cert.course else "Unknown",
        "teacher_name": cert.teacher.full_name if cert.teacher else "Unknown",
        "issued_at": cert.issued_at.isoformat(),
        "pdf_url": cert.certificate_pdf_url,
        "verify_url": f"/verify/{str(cert.id)}"
    }


@router.get("/my")
async def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(Certificate.student_id == current_user.id).all()
    return {"certificates": [_serialize_cert(c) for c in certs]}


# Must be declared before /{certificate_id} to avoid route conflict
@router.get("/verify/{certificate_id}")
async def verify_certificate(certificate_id: str, db: Session = Depends(get_db)):
    """Public endpoint — no authentication required."""
    cert = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not cert:
        return {"valid": False, "message": "Certificate not found"}
    return {
        "valid": True,
        "certificate_id": str(cert.id),
        "student_name": cert.student.full_name if cert.student else "Unknown",
        "course_name": cert.course.title if cert.course else "Unknown",
        "teacher_name": cert.teacher.full_name if cert.teacher else "Unknown",
        "issued_at": cert.issued_at.isoformat(),
        "pdf_url": cert.certificate_pdf_url,
    }


@router.post("/generate/{course_id}")
async def generate_certificate(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if not course.certificate_enabled:
        raise HTTPException(status_code=400, detail="Certificates not enabled for this course")

    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.is_active == True
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    # Check if already issued
    existing = db.query(Certificate).filter(
        Certificate.student_id == current_user.id,
        Certificate.course_id == course_id
    ).first()
    if existing:
        return {"certificate": _serialize_cert(existing), "already_issued": True}

    # Check completion
    total_lessons = db.query(func.count(Lesson.id)).join(
        Chapter, Lesson.chapter_id == Chapter.id
    ).filter(Chapter.course_id == course_id, Lesson.is_published == True).scalar() or 0

    completed = db.query(func.count(StudentProgress.id)).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.course_id == course_id,
        StudentProgress.completed == True
    ).scalar() or 0

    completion_pct = (completed / total_lessons * 100) if total_lessons > 0 else 0
    required = float(course.completion_requirement_percent or 80)
    if completion_pct < required:
        raise HTTPException(
            status_code=400,
            detail=f"Course not completed. Progress: {round(completion_pct)}% / required {round(required)}%"
        )

    from datetime import datetime, timezone
    cert = Certificate(
        student_id=current_user.id,
        course_id=course_id,
        teacher_id=course.teacher_id,
        issued_at=datetime.now(timezone.utc),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return {"certificate": _serialize_cert(cert), "already_issued": False}


@router.get("/{certificate_id}")
async def get_certificate(
    certificate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(
        Certificate.id == certificate_id,
        Certificate.student_id == current_user.id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return _serialize_cert(cert)
