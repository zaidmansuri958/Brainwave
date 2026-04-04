import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    payment_id = Column(UUID(as_uuid=True), nullable=True)
    amount_paid = Column(Numeric(10, 2), nullable=True)
    is_active = Column(Boolean, default=True)
    access_type = Column(String(20), default="lifetime")  # lifetime, limited
    access_starts_at = Column(DateTime(timezone=True), nullable=True)
    access_expires_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (UniqueConstraint("student_id", "course_id", name="unique_enrollment"),)

    # Relationships
    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
    course = relationship("Course", back_populates="enrollments")
    refund_requests = relationship("RefundRequest", back_populates="enrollment")
