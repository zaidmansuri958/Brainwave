from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.live_session import LiveSession
from app.models.enrollment import Enrollment
from app.middleware.auth_middleware import get_current_user, get_current_teacher
from app.models.user import User
from app.config import settings
from app.services.notification_service import create_notification
from datetime import datetime
import uuid

router = APIRouter(tags=["Live Sessions"])


@router.get("/courses/{course_id}/live-sessions")
async def get_live_sessions(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(LiveSession).filter(
        LiveSession.course_id == course_id
    ).order_by(LiveSession.scheduled_at.desc()).all()

    return {
        "sessions": [
            {
                "id": str(s.id),
                "title": s.title,
                "description": s.description,
                "scheduled_at": s.scheduled_at.isoformat(),
                "duration_minutes": s.duration_minutes,
                "status": s.status,
                "recording_url": s.recording_url,
                "jitsi_room_name": s.jitsi_room_name if current_user.role == "teacher" else None
            }
            for s in sessions
        ]
    }


@router.post("/courses/{course_id}/live-sessions")
async def create_live_session(
    course_id: str,
    title: str,
    scheduled_at: str,
    duration_minutes: int = 60,
    description: str = None,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    room_name = f"brainwave-{course_id[:8]}-{uuid.uuid4().hex[:8]}"
    room_password = uuid.uuid4().hex[:12]

    session = LiveSession(
        course_id=course_id,
        teacher_id=current_user.id,
        title=title,
        description=description,
        scheduled_at=datetime.fromisoformat(scheduled_at),
        duration_minutes=duration_minutes,
        jitsi_room_name=room_name,
        jitsi_room_password=room_password,
        status="scheduled"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Notify enrolled students
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id, Enrollment.is_active == True).all()
    for enrollment in enrollments:
        create_notification(
            db, str(enrollment.student_id), "live_session_scheduled",
            f"Live Session: {title}",
            f"A new live session has been scheduled for {scheduled_at}",
            {"course_id": course_id, "session_id": str(session.id)}
        )

    return {
        "session": {
            "id": str(session.id),
            "title": session.title,
            "scheduled_at": session.scheduled_at.isoformat(),
            "status": session.status
        },
        "jitsi_room_name": room_name,
        "jitsi_url": f"https://{settings.jitsi_domain}/{room_name}"
    }


@router.get("/live-sessions/{session_id}/join")
async def join_live_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(LiveSession).filter(LiveSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "jitsi_domain": settings.jitsi_domain,
        "room_name": session.jitsi_room_name,
        "room_password": session.jitsi_room_password,
        "display_name": current_user.full_name,
        "is_moderator": current_user.role == "teacher",
        "jitsi_url": f"https://{settings.jitsi_domain}/{session.jitsi_room_name}"
    }
