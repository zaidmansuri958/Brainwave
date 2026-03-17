import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String(10), default="INR")
    category = Column(String(100), nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    difficulty_level = Column(String(20), nullable=True)
    language = Column(String(50), default="English")
    status = Column(String(20), default="draft")
    total_chapters = Column(Integer, default=0)
    total_duration_minutes = Column(Integer, default=0)
    enrolled_count = Column(Integer, default=0)
    avg_rating = Column(Numeric(3, 2), default=0.00)
    review_count = Column(Integer, default=0)
    completion_requirement_percent = Column(Integer, default=80)
    quiz_pass_percent = Column(Integer, default=60)
    certificate_enabled = Column(Boolean, default=True)
    ai_processing_status = Column(String(30), default="pending")
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    teacher = relationship("User", back_populates="courses_taught", foreign_keys=[teacher_id])
    chapters = relationship("Chapter", back_populates="course", cascade="all, delete-orphan", order_by="Chapter.order_index")
    lessons = relationship("Lesson", back_populates="course")
    materials = relationship("CourseMaterial", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course")
    community_posts = relationship("CommunityPost", back_populates="course")
    live_sessions = relationship("LiveSession", back_populates="course")
    doubt_sessions = relationship("DoubtSession", back_populates="course")
    certificates = relationship("Certificate", back_populates="course")
    reviews = relationship("Review", back_populates="course")
    risk_scores = relationship("StudentRiskScore", back_populates="course")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False)
    is_free_preview = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="chapters")
    lessons = relationship("Lesson", back_populates="chapter", cascade="all, delete-orphan", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    title = Column(String(255), nullable=False)
    lesson_type = Column(String(20), nullable=True)  # video, document, quiz, live
    order_index = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=True)
    video_url = Column(String(500), nullable=True)
    document_url = Column(String(500), nullable=True)
    raw_transcript = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    chapter = relationship("Chapter", back_populates="lessons")
    course = relationship("Course", back_populates="lessons")
    quizzes = relationship("Quiz", back_populates="lesson")
    progress_records = relationship("StudentProgress", back_populates="lesson")


class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)  # video, pdf, ppt, doc, audio
    file_url = Column(String(500), nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    processing_status = Column(String(30), default="pending")
    processing_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="materials")
