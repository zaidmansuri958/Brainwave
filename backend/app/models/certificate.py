import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    certificate_pdf_url = Column(String(500), nullable=True)
    certificate_hash = Column(String(64), nullable=True)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("student_id", "course_id", name="unique_certificate"),)

    # Relationships
    student = relationship("User", back_populates="certificates", foreign_keys=[student_id])
    course = relationship("Course", back_populates="certificates")
    teacher = relationship("User", foreign_keys=[teacher_id])
