import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    payee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    payment_type = Column(String(30), nullable=True)  # course_purchase, doubt_session
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    razorpay_payment_id = Column(String(255), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    platform_cut = Column(Numeric(10, 2), nullable=True)
    platform_cut_percent_applied = Column(Numeric(5, 2), nullable=True)
    teacher_earning = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(10), default="INR")
    status = Column(String(20), default="pending")  # pending, completed, failed, refunded
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    payer = relationship("User", foreign_keys=[payer_id])
    payee = relationship("User", foreign_keys=[payee_id])
    refund_requests = relationship("RefundRequest", back_populates="payment")


class RefundRequest(Base):
    __tablename__ = "refund_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("enrollments.id"))
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"))
    reason = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    watch_percent_at_request = Column(Numeric(5, 2), nullable=True)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    admin_note = Column(Text, nullable=True)
    razorpay_refund_id = Column(String(255), nullable=True)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    enrollment = relationship("Enrollment", back_populates="refund_requests")
    payment = relationship("Payment", back_populates="refund_requests")


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Numeric(10, 2), nullable=True)
    razorpay_payout_id = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    initiated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    initiated_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id])
    initiator = relationship("User", foreign_keys=[initiated_by])
