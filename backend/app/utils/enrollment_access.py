from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.enrollment import Enrollment


def enrollment_is_active_valid(enrollment: Enrollment) -> bool:
    if not enrollment or not enrollment.is_active:
        return False
    if enrollment.access_type == "lifetime" or enrollment.access_expires_at is None:
        return True
    return enrollment.access_expires_at > datetime.now(timezone.utc)


def get_valid_enrollment(db: Session, student_id, course_id: str) -> Enrollment:
    e = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.course_id == course_id,
            Enrollment.is_active == True,
        )
        .first()
    )
    if e and enrollment_is_active_valid(e):
        return e
    return None
