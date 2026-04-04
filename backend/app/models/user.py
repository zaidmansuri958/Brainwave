import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(20), nullable=False)  # student, teacher, admin
    is_verified = Column(Boolean, default=False)
    google_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)
    courses_taught = relationship("Course", back_populates="teacher", foreign_keys="Course.teacher_id")
    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    notifications = relationship("Notification", back_populates="user")
    certificates = relationship("Certificate", back_populates="student", foreign_keys="Certificate.student_id")
    community_posts = relationship("CommunityPost", back_populates="author")
    risk_scores = relationship("StudentRiskScore", back_populates="student")


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    bio = Column(Text, nullable=True)
    expertise_areas = Column(ARRAY(String), nullable=True)
    # Onboarding / KYC (server_default keeps existing DB rows usable until admin re-review)
    onboarding_status = Column(String(20), nullable=False, server_default="approved")  # draft, submitted, approved, rejected
    legal_name = Column(String(255), nullable=True)
    years_teaching = Column(Integer, nullable=True)
    past_employers = Column(JSONB, nullable=True)
    highest_degree = Column(String(255), nullable=True)
    degree_proof_url = Column(String(500), nullable=True)
    aadhaar_doc_url = Column(String(500), nullable=True)
    pan_doc_url = Column(String(500), nullable=True)
    onboarding_submitted_at = Column(DateTime(timezone=True), nullable=True)
    onboarding_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    identity_verified = Column(Boolean, default=False)
    expert_verified = Column(Boolean, default=False)
    outcome_verified = Column(Boolean, default=False)
    verification_documents = Column(JSONB, nullable=True)
    credibility_score = Column(Numeric(3, 2), default=0.00)
    total_students = Column(Integer, default=0)
    avg_completion_rate = Column(Numeric(5, 2), default=0.00)
    payout_bank_details = Column(JSONB, nullable=True)
    bank_account_name = Column(String(255), nullable=True)
    bank_account_number = Column(String(50), nullable=True)
    bank_ifsc = Column(String(20), nullable=True)
    bank_verified = Column(Boolean, default=False)
    razorpay_contact_id = Column(String(100), nullable=True)
    razorpay_fund_account_id = Column(String(100), nullable=True)
    pending_payout = Column(Numeric(10, 2), default=0.00)
    total_paid_out = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="teacher_profile")
