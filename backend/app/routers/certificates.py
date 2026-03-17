from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.certificate import Certificate
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get("/my")
async def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(Certificate.student_id == current_user.id).all()
    result = []
    for cert in certs:
        result.append({
            "id": str(cert.id),
            "course_name": cert.course.title if cert.course else "Unknown",
            "teacher_name": cert.teacher.full_name if cert.teacher else "Unknown",
            "issued_at": cert.issued_at.isoformat(),
            "pdf_url": cert.certificate_pdf_url,
            "verify_url": f"/verify/{str(cert.id)}"
        })
    return {"certificates": result}


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
