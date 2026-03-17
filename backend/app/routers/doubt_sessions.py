from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.doubt_session import DoubtSession, DoubtSessionBooking
from app.models.enrollment import Enrollment
from app.middleware.auth_middleware import get_current_user, get_current_teacher
from app.models.user import User
from app.services.payment_service import create_razorpay_order, verify_razorpay_signature, record_payment
from app.services.notification_service import create_notification
from app.config import settings
from datetime import datetime
import uuid

router = APIRouter(tags=["Doubt Sessions"])


@router.get("/courses/{course_id}/doubt-sessions")
async def get_doubt_sessions(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(DoubtSession).filter(
        DoubtSession.course_id == course_id,
        DoubtSession.status.in_(["available", "booked"])
    ).order_by(DoubtSession.scheduled_at.asc()).all()

    result = []
    for s in sessions:
        booking_count = len(s.bookings)
        result.append({
            "id": str(s.id),
            "session_type": s.session_type,
            "max_students": s.max_students,
            "duration_minutes": s.duration_minutes,
            "price": float(s.price),
            "topic": s.topic,
            "scheduled_at": s.scheduled_at.isoformat(),
            "status": s.status,
            "spots_left": s.max_students - booking_count,
            "teacher_name": s.teacher.full_name if s.teacher else "Unknown"
        })

    return {"sessions": result}


@router.post("/courses/{course_id}/doubt-sessions")
async def create_doubt_session(
    course_id: str,
    session_type: str,
    max_students: int = 1,
    duration_minutes: int = 30,
    price: float = 500,
    scheduled_at: str = None,
    topic: str = None,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    room_name = f"doubt-{uuid.uuid4().hex[:12]}"
    session = DoubtSession(
        teacher_id=current_user.id,
        course_id=course_id,
        session_type=session_type,
        max_students=max_students,
        duration_minutes=duration_minutes,
        price=price,
        topic=topic,
        scheduled_at=datetime.fromisoformat(scheduled_at) if scheduled_at else datetime.utcnow(),
        jitsi_room_name=room_name,
        jitsi_room_password=uuid.uuid4().hex[:12],
        status="available"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session": {"id": str(session.id), "topic": session.topic, "scheduled_at": session.scheduled_at.isoformat()}}


@router.post("/doubt-sessions/{session_id}/initiate-booking")
async def initiate_doubt_booking(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DoubtSession).filter(DoubtSession.id == session_id, DoubtSession.status == "available").first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not available")

    booking_count = len(session.bookings)
    if booking_count >= session.max_students:
        raise HTTPException(status_code=400, detail="Session is full")

    order = create_razorpay_order(float(session.price))
    return {
        "razorpay_order_id": order["id"],
        "amount": float(session.price),
        "currency": "INR"
    }


@router.post("/doubt-sessions/{session_id}/book")
async def book_doubt_session(
    session_id: str,
    razorpay_payment_id: str,
    razorpay_order_id: str,
    razorpay_signature: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_razorpay_signature(razorpay_payment_id, razorpay_order_id, razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed")

    session = db.query(DoubtSession).filter(DoubtSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    existing = db.query(DoubtSessionBooking).filter(
        DoubtSessionBooking.doubt_session_id == session_id,
        DoubtSessionBooking.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already booked")

    payment = record_payment(
        db,
        payer_id=str(current_user.id),
        payee_id=str(session.teacher_id),
        payment_type="doubt_session",
        reference_id=session_id,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        total_amount=float(session.price)
    )

    booking = DoubtSessionBooking(
        doubt_session_id=session_id,
        student_id=current_user.id,
        payment_id=payment.id,
        amount_paid=session.price
    )
    db.add(booking)

    # Update session status if full
    if len(session.bookings) + 1 >= session.max_students:
        session.status = "booked"

    db.commit()

    # Notify both parties
    create_notification(
        db, str(session.teacher_id), "doubt_session_booked",
        "Doubt Session Booked",
        f"{current_user.full_name} booked your doubt session: {session.topic}",
        {"session_id": session_id}
    )
    create_notification(
        db, str(current_user.id), "doubt_session_confirmed",
        "Booking Confirmed",
        f"Your doubt session '{session.topic}' is confirmed for {session.scheduled_at}",
        {"session_id": session_id, "jitsi_url": f"https://{settings.jitsi_domain}/{session.jitsi_room_name}"}
    )

    return {
        "booking_id": str(booking.id),
        "jitsi_url": f"https://{settings.jitsi_domain}/{session.jitsi_room_name}",
        "scheduled_at": session.scheduled_at.isoformat()
    }
