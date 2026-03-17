import uuid
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"))
    watch_percent = Column(Integer, default=0)
    watch_duration_seconds = Column(Integer, default=0)
    rewatch_count = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    last_watched_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (UniqueConstraint("student_id", "lesson_id", name="unique_progress"),)

    # Relationships
    lesson = relationship("Lesson", back_populates="progress_records")
