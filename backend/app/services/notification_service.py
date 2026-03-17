from sqlalchemy.orm import Session
from app.models.notification import Notification
import uuid


def create_notification(
    db: Session,
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    extra_data: dict = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        extra_data=extra_data or {},
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_user_notifications(db: Session, user_id: str, limit: int = 50):
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(limit).all()


def get_unread_count(db: Session, user_id: str) -> int:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()


def mark_notification_read(db: Session, notification_id: str, user_id: str):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()


def mark_all_read(db: Session, user_id: str):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
