from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class EnrollmentInitiate(BaseModel):
    course_id: UUID


class EnrollmentConfirm(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    course_id: UUID


class EnrollmentResponse(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    enrolled_at: datetime
    amount_paid: Optional[Decimal] = None
    is_active: bool

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    id: UUID
    payment_type: Optional[str] = None
    total_amount: Optional[Decimal] = None
    platform_cut: Optional[Decimal] = None
    teacher_earning: Optional[Decimal] = None
    currency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RefundRequest(BaseModel):
    enrollment_id: UUID
    reason: str
    description: Optional[str] = None


class DoubtSessionBook(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
