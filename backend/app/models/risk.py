import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class StudentRiskScore(Base):
    __tablename__ = "student_risk_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    risk_level = Column(String(10), nullable=True)  # low, medium, high
    risk_score = Column(Numeric(5, 4), nullable=True)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
    features_snapshot = Column(JSONB, nullable=True)
    teacher_notified = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint("student_id", "course_id", name="unique_risk_score"),)

    # Relationships
    student = relationship("User", back_populates="risk_scores")
    course = relationship("Course", back_populates="risk_scores")
