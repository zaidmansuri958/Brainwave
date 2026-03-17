import razorpay
import hmac
import hashlib
from sqlalchemy.orm import Session
from app.config import settings
from app.models.payment import Payment, Payout
from app.models.course import Course
from app.models.user import TeacherProfile
from fastapi import HTTPException
import uuid

razorpay_client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def create_razorpay_order(amount_inr: float, currency: str = "INR") -> dict:
    """Create a Razorpay order. Amount in rupees."""
    try:
        order = razorpay_client.order.create({
            "amount": int(amount_inr * 100),  # paise
            "currency": currency,
            "payment_capture": 1
        })
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {e}")


def verify_razorpay_signature(payment_id: str, order_id: str, signature: str) -> bool:
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.razorpay_key_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    expected = hmac.new(
        settings.razorpay_webhook_secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def record_payment(
    db: Session,
    payer_id: str,
    payee_id: str,
    payment_type: str,
    reference_id: str,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    total_amount: float,
    currency: str = "INR"
) -> Payment:
    platform_cut = total_amount * settings.platform_cut_percent / 100
    teacher_earning = total_amount - platform_cut

    payment = Payment(
        payer_id=payer_id,
        payee_id=payee_id,
        payment_type=payment_type,
        reference_id=reference_id,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        total_amount=total_amount,
        platform_cut=platform_cut,
        teacher_earning=teacher_earning,
        currency=currency,
        status="completed"
    )
    db.add(payment)

    # Update teacher's pending payout
    teacher_profile = db.query(TeacherProfile).filter(
        TeacherProfile.user_id == payee_id
    ).first()
    if teacher_profile:
        teacher_profile.pending_payout = float(teacher_profile.pending_payout or 0) + teacher_earning

    db.commit()
    db.refresh(payment)
    return payment


def process_refund(payment_id: str, amount_rupees: float) -> dict:
    try:
        payment = razorpay_client.payment.fetch(payment_id)
        refund = razorpay_client.payment.refund(payment_id, {
            "amount": int(amount_rupees * 100),
            "speed": "normal",
            "notes": {"reason": "Student refund approved by admin"}
        })
        return refund
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refund failed: {e}")
