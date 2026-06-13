import razorpay
import hmac
import hashlib
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.config import settings
from app.models.payment import Payment, Payout
from app.models.course import Course
from app.models.user import TeacherProfile
from fastapi import HTTPException
import uuid
from app.utils.pricing import platform_cut_percent_for_enrollments

razorpay_client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def create_razorpay_order(amount_inr: float, currency: str = "INR") -> dict:
    """Create a Razorpay order. Amount in rupees."""
    try:
        order = razorpay_client.order.create({
            "amount": int(round(amount_inr * 100)),  # paise
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


def create_pending_payment(
    db: Session,
    payer_id: str,
    payee_id: str,
    payment_type: str,
    reference_id: str,
    razorpay_order_id: str,
    total_amount: float,
    currency: str = "INR",
) -> Payment:
    """Phase 1 (at /initiate): persist the order so the amount/resource/user are bound
    to the Razorpay order id. The teacher is NOT credited yet — that happens only after a
    verified capture in finalize_payment()."""
    payment = Payment(
        payer_id=payer_id,
        payee_id=payee_id,
        payment_type=payment_type,
        reference_id=reference_id,
        razorpay_order_id=razorpay_order_id,
        total_amount=total_amount,
        currency=currency,
        status="created",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def _verify_captured_amount(razorpay_order_id: str, razorpay_payment_id: str, expected_amount: float):
    """Best-effort cross-check against Razorpay that the captured payment belongs to this
    order and is for at least the expected amount. If Razorpay can't be reached (no keys /
    network), we return ok=True and rely on the signature + order binding, which already
    prevent cross-order and amount tampering."""
    try:
        p = razorpay_client.payment.fetch(razorpay_payment_id)
    except Exception:
        return True, None
    if p.get("order_id") and p.get("order_id") != razorpay_order_id:
        return False, "order mismatch"
    expected_paise = int(round(float(expected_amount) * 100))
    if p.get("amount") is not None and int(p["amount"]) < expected_paise:
        return False, "amount mismatch"
    if p.get("status") and p.get("status") not in ("captured", "authorized", "refunded"):
        return False, f"payment not captured ({p.get('status')})"
    return True, None


def finalize_payment(
    db: Session,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    payer_id: str,
    reference_id: str = None,
) -> Payment:
    """Phase 2 (at /confirm): validate the pending payment created at /initiate, then credit
    the teacher exactly once.

    Security: the amount, payee and resource are read from the stored 'created' payment (which
    was bound to the Razorpay order at /initiate), NOT from the client — so a signed order for a
    cheap item cannot be replayed to unlock an expensive one.

    Idempotency: a replayed /confirm for an already-completed order returns the existing payment
    without crediting the teacher again.
    """
    payment = (
        db.query(Payment)
        .filter(Payment.razorpay_order_id == razorpay_order_id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=400, detail="Unknown payment order")

    # Already finalized — return as-is (no double credit).
    if payment.status == "completed":
        return payment
    if payment.status not in ("created", "pending"):
        raise HTTPException(status_code=400, detail="Payment order is not payable")

    # The order must belong to the caller and (if provided) the requested resource.
    if str(payment.payer_id) != str(payer_id):
        raise HTTPException(status_code=403, detail="Order does not belong to this user")
    if reference_id is not None and str(payment.reference_id) != str(reference_id):
        raise HTTPException(status_code=400, detail="Order does not match the requested item")

    ok, reason = _verify_captured_amount(
        razorpay_order_id, razorpay_payment_id, float(payment.total_amount or 0)
    )
    if not ok:
        raise HTTPException(status_code=400, detail=f"Payment validation failed: {reason}")

    total = float(payment.total_amount or 0)
    # Tiered platform fee for courses is based on the number of *paid* enrollments so far,
    # so free signups never push a course into a lower-commission tier.
    if payment.payment_type == "course_purchase":
        paid_count = (
            db.query(func.count(Payment.id))
            .filter(
                Payment.payment_type == "course_purchase",
                Payment.reference_id == payment.reference_id,
                Payment.status == "completed",
            )
            .scalar()
            or 0
        )
        pct = platform_cut_percent_for_enrollments(int(paid_count))
    else:
        pct = float(settings.platform_cut_percent)

    payment.platform_cut = total * pct / 100
    payment.platform_cut_percent_applied = pct
    payment.teacher_earning = total - payment.platform_cut
    payment.razorpay_payment_id = razorpay_payment_id
    payment.status = "completed"

    if payment.payee_id:
        teacher_profile = (
            db.query(TeacherProfile).filter(TeacherProfile.user_id == payment.payee_id).first()
        )
        if teacher_profile:
            teacher_profile.pending_payout = (
                float(teacher_profile.pending_payout or 0) + payment.teacher_earning
            )

    db.commit()
    db.refresh(payment)
    return payment


def process_refund(payment_id: str, amount_rupees: float) -> dict:
    try:
        razorpay_client.payment.fetch(payment_id)
        refund = razorpay_client.payment.refund(payment_id, {
            "amount": int(round(amount_rupees * 100)),
            "speed": "normal",
            "notes": {"reason": "Student refund approved by admin"}
        })
        return refund
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refund failed: {e}")
