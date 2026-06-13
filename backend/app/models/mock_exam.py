import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MockTestPackage(Base):
    __tablename__ = "mock_test_packages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(20), default="draft")
    moderation_status = Column(String(30), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher = relationship("User", foreign_keys=[teacher_id])
    papers = relationship("MockTestPaper", back_populates="package", cascade="all, delete-orphan", order_by="MockTestPaper.order_index")


class MockTestPaper(Base):
    __tablename__ = "mock_test_papers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    package_id = Column(UUID(as_uuid=True), ForeignKey("mock_test_packages.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    order_index = Column(Integer, default=0)
    time_limit_minutes = Column(Integer, nullable=False)
    total_marks = Column(Numeric(10, 2), nullable=True)
    marks_per_question = Column(Numeric(5, 2), nullable=False, default=1.0)
    negative_marks = Column(Numeric(5, 2), nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    package = relationship("MockTestPackage", back_populates="papers")
    sections = relationship("MockTestSection", back_populates="paper", cascade="all, delete-orphan", order_by="MockTestSection.order_index")
    attempts = relationship("MockTestAttempt", back_populates="paper")


class MockTestSection(Base):
    __tablename__ = "mock_test_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    paper_id = Column(UUID(as_uuid=True), ForeignKey("mock_test_papers.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    order_index = Column(Integer, default=0)

    paper = relationship("MockTestPaper", back_populates="sections")
    questions = relationship("MockTestQuestion", back_populates="section", cascade="all, delete-orphan", order_by="MockTestQuestion.order_index")


class MockTestQuestion(Base):
    __tablename__ = "mock_test_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("mock_test_sections.id", ondelete="CASCADE"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), nullable=True)  # mcq, mcq_multi, numeric, text
    options = Column(JSONB, nullable=True)
    correct_answer = Column(Text, nullable=True)
    marks = Column(Numeric(10, 2), default=1)
    order_index = Column(Integer, default=0)

    section = relationship("MockTestSection", back_populates="questions")


class MockTestPurchase(Base):
    __tablename__ = "mock_test_purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    package_id = Column(UUID(as_uuid=True), ForeignKey("mock_test_packages.id"))
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    amount_paid = Column(Numeric(10, 2), nullable=True)
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", foreign_keys=[student_id])
    package = relationship("MockTestPackage")


class MockTestAttempt(Base):
    __tablename__ = "mock_test_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    paper_id = Column(UUID(as_uuid=True), ForeignKey("mock_test_papers.id"))
    answers = Column(JSONB, nullable=True)
    score_percent = Column(Numeric(5, 2), nullable=True)
    total_score = Column(Numeric(10, 2), nullable=True)
    time_taken_seconds = Column(Integer, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("User", foreign_keys=[student_id])
    paper = relationship("MockTestPaper", back_populates="attempts")


class MockTestReview(Base):
    __tablename__ = "mock_test_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    package_id = Column(UUID(as_uuid=True), ForeignKey("mock_test_packages.id", ondelete="CASCADE"))
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("student_id", "package_id", name="unique_mock_review"),)

    student = relationship("User", foreign_keys=[student_id])
    package = relationship("MockTestPackage")
