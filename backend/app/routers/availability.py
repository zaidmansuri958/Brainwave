"""Teacher weekly availability → concrete doubt session slots."""
import uuid
from datetime import datetime, timedelta, date, time as dtime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.middleware.auth_middleware import get_current_teacher, get_current_user
from app.models.user import User
from app.models.teacher_availability import TeacherAvailabilityRule
from app.models.doubt_session import DoubtSession, DoubtSessionBooking

router = APIRouter(prefix="/teacher/availability", tags=["Availability"])


class RuleCreate(BaseModel):
    weekday: int  # 0=Mon .. 6=Sun
    start_time: str  # "HH:MM"
    end_time: str
    timezone: str = "Asia/Kolkata"
    slot_duration_minutes: int = 30
    price: float = 0


def _parse_t(s: str) -> dtime:
    h, m = s.split(":")
    return dtime(int(h), int(m))


@router.post("/rules")
async def create_rule(
    data: RuleCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    r = TeacherAvailabilityRule(
        teacher_id=current_user.id,
        weekday=data.weekday,
        start_time=_parse_t(data.start_time),
        end_time=_parse_t(data.end_time),
        timezone=data.timezone,
        slot_duration_minutes=data.slot_duration_minutes,
        price=data.price,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"id": str(r.id)}


@router.get("/rules")
async def list_rules(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    rows = db.query(TeacherAvailabilityRule).filter(
        TeacherAvailabilityRule.teacher_id == current_user.id
    ).all()
    return {
        "rules": [
            {
                "id": str(r.id),
                "weekday": r.weekday,
                "start_time": r.start_time.isoformat(),
                "end_time": r.end_time.isoformat(),
                "timezone": r.timezone,
                "slot_duration_minutes": r.slot_duration_minutes,
                "price": float(r.price),
                "is_active": r.is_active,
            }
            for r in rows
        ]
    }


@router.post("/generate-slots")
async def generate_slots(
    days_ahead: int = 14,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    rules = (
        db.query(TeacherAvailabilityRule)
        .filter(
            TeacherAvailabilityRule.teacher_id == current_user.id,
            TeacherAvailabilityRule.is_active == True,
        )
        .all()
    )
    if not rules:
        raise HTTPException(status_code=400, detail="No rules")
    created = 0
    today = date.today()
    for d in range(days_ahead):
        day = today + timedelta(days=d)
        wd = day.weekday()  # Mon=0
        for rule in rules:
            if rule.weekday != wd:
                continue
            tz = ZoneInfo(rule.timezone or "UTC")
            start_dt = datetime.combine(day, rule.start_time, tzinfo=tz)
            end_dt = datetime.combine(day, rule.end_time, tzinfo=tz)
            step = timedelta(minutes=rule.slot_duration_minutes)
            t = start_dt
            while t + step <= end_dt:
                exists = (
                    db.query(DoubtSession)
                    .filter(
                        DoubtSession.teacher_id == current_user.id,
                        DoubtSession.scheduled_at == t,
                    )
                    .first()
                )
                if not exists:
                    room = f"doubt-{uuid.uuid4().hex[:12]}"
                    s = DoubtSession(
                        teacher_id=current_user.id,
                        course_id=None,
                        session_type="one_on_one",
                        max_students=1,
                        duration_minutes=rule.slot_duration_minutes,
                        price=rule.price,
                        topic="Doubt session",
                        scheduled_at=t,
                        jitsi_room_name=room,
                        jitsi_room_password=uuid.uuid4().hex[:12],
                        status="available",
                    )
                    db.add(s)
                    created += 1
                t += step
    db.commit()
    return {"slots_created": created}


@router.get("/teachers/{teacher_id}/slots")
async def public_teacher_slots(
    teacher_id: str,
    db: Session = Depends(get_db),
):
    from datetime import timezone as tz

    now = datetime.now(tz.utc)
    sessions = (
        db.query(DoubtSession)
        .filter(
            DoubtSession.teacher_id == teacher_id,
            DoubtSession.scheduled_at >= now,
            DoubtSession.status == "available",
        )
        .order_by(DoubtSession.scheduled_at.asc())
        .limit(100)
        .all()
    )
    out = []
    for s in sessions:
        booked = len(s.bookings)
        out.append(
            {
                "id": str(s.id),
                "scheduled_at": s.scheduled_at.isoformat(),
                "duration_minutes": s.duration_minutes,
                "price": float(s.price),
                "spots_left": s.max_students - booked,
            }
        )
    return {"sessions": out}
