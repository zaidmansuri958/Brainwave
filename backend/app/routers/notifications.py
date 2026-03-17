from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.services.notification_service import (
    get_user_notifications, get_unread_count, mark_notification_read, mark_all_read
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = get_user_notifications(db, str(current_user.id))
    unread = get_unread_count(db, str(current_user.id))
    return {
        "notifications": [
            {
                "id": str(n.id),
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "extra_data": n.extra_data,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ],
        "unread_count": unread
    }


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mark_notification_read(db, notification_id, str(current_user.id))
    return {"message": "Marked as read"}


@router.patch("/read-all")
async def read_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mark_all_read(db, str(current_user.id))
    return {"message": "All notifications marked as read"}
