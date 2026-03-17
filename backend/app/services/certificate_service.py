from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from sqlalchemy.orm import Session
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.user import User
from app.services.storage_service import upload_file
import hashlib
import io
import uuid
from datetime import datetime


def generate_certificate_pdf(
    student_name: str,
    course_name: str,
    teacher_name: str,
    certificate_id: str,
    issued_at: datetime,
    platform_name: str = "Brainwave.ai"
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title", parent=styles["Title"],
        fontSize=36, textColor=colors.HexColor("#4F46E5"),
        alignment=TA_CENTER, spaceAfter=20
    )
    subtitle_style = ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontSize=18, textColor=colors.HexColor("#6B7280"),
        alignment=TA_CENTER, spaceAfter=10
    )
    name_style = ParagraphStyle(
        "Name", parent=styles["Normal"],
        fontSize=28, textColor=colors.HexColor("#111827"),
        alignment=TA_CENTER, spaceAfter=10, fontName="Helvetica-Bold"
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontSize=14, textColor=colors.HexColor("#374151"),
        alignment=TA_CENTER, spaceAfter=8
    )
    small_style = ParagraphStyle(
        "Small", parent=styles["Normal"],
        fontSize=10, textColor=colors.HexColor("#9CA3AF"),
        alignment=TA_CENTER
    )

    story = [
        Spacer(1, 0.3 * inch),
        Paragraph(platform_name, title_style),
        Paragraph("Certificate of Completion", subtitle_style),
        Spacer(1, 0.3 * inch),
        Paragraph("This certifies that", body_style),
        Paragraph(student_name, name_style),
        Paragraph("has successfully completed the course", body_style),
        Paragraph(f"<b>{course_name}</b>", name_style),
        Paragraph(f"taught by {teacher_name}", body_style),
        Spacer(1, 0.2 * inch),
        Paragraph(f"Date: {issued_at.strftime('%B %d, %Y')}", body_style),
        Spacer(1, 0.3 * inch),
        Paragraph(f"Certificate ID: {certificate_id}", small_style),
    ]

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def issue_certificate(db: Session, student_id: str, course_id: str) -> Certificate:
    # Check if already issued
    existing = db.query(Certificate).filter(
        Certificate.student_id == student_id,
        Certificate.course_id == course_id
    ).first()
    if existing:
        return existing

    student = db.query(User).filter(User.id == student_id).first()
    course = db.query(Course).filter(Course.id == course_id).first()
    teacher = db.query(User).filter(User.id == course.teacher_id).first()

    cert_id = str(uuid.uuid4())
    issued_at = datetime.utcnow()

    pdf_bytes = generate_certificate_pdf(
        student_name=student.full_name,
        course_name=course.title,
        teacher_name=teacher.full_name,
        certificate_id=cert_id,
        issued_at=issued_at,
    )

    pdf_hash = hashlib.sha256(pdf_bytes).hexdigest()

    # Upload PDF to MinIO
    pdf_url = upload_file(
        pdf_bytes,
        "certificates",
        f"{cert_id}.pdf",
        "application/pdf"
    )

    cert = Certificate(
        id=uuid.UUID(cert_id),
        student_id=student_id,
        course_id=course_id,
        teacher_id=course.teacher_id,
        certificate_pdf_url=pdf_url,
        certificate_hash=pdf_hash,
        issued_at=issued_at,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert
