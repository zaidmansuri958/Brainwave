from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.course import Course
from app.models.promotion import CoursePromotion


def platform_cut_percent_for_enrollments(enrolled_count: int) -> float:
    """Tiered platform fee by current enrollment count (before the new sale)."""
    if enrolled_count <= 2000:
        return 15.0
    if enrolled_count < 10000:
        return 12.0
    return 10.0


def effective_course_price(db: Session, course: Course, at: datetime = None) -> float:
    at = at or datetime.now(timezone.utc)
    base = float(course.price or 0)
    promos = (
        db.query(CoursePromotion)
        .filter(
            CoursePromotion.course_id == course.id,
            CoursePromotion.is_active == True,
            CoursePromotion.starts_at <= at,
            CoursePromotion.ends_at >= at,
        )
        .all()
    )
    if not promos:
        return round(base, 2)
    p = promos[0]
    if p.price_override is not None:
        return round(float(p.price_override), 2)
    if p.discount_percent is not None:
        return round(base * (1 - float(p.discount_percent) / 100), 2)
    return round(base, 2)


def enrollment_access_fields(course: Course):
    """Returns dict access_type, access_starts_at, access_expires_at for new enrollment."""
    now = datetime.now(timezone.utc)
    months = course.default_access_months
    if months and months > 0:
        return {
            "access_type": "limited",
            "access_starts_at": now,
            "access_expires_at": now + timedelta(days=30 * int(months)),
        }
    return {"access_type": "lifetime", "access_starts_at": now, "access_expires_at": None}
