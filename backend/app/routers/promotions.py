from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.middleware.auth_middleware import get_current_teacher
from app.models.user import User
from app.models.course import Course
from app.models.promotion import CoursePromotion

router = APIRouter(prefix="/teacher/promotions", tags=["Promotions"])


class PromotionCreate(BaseModel):
    course_id: str
    discount_percent: Optional[float] = None
    price_override: Optional[float] = None
    starts_at: datetime
    ends_at: datetime


@router.post("")
async def create_promotion(
    data: PromotionCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    c = db.query(Course).filter(Course.id == data.course_id, Course.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    p = CoursePromotion(
        course_id=data.course_id,
        discount_percent=data.discount_percent,
        price_override=data.price_override,
        starts_at=data.starts_at,
        ends_at=data.ends_at,
        is_active=True,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": str(p.id)}


@router.get("/courses/{course_id}")
async def list_promotions(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    c = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    rows = db.query(CoursePromotion).filter(CoursePromotion.course_id == course_id).all()
    return {
        "promotions": [
            {
                "id": str(r.id),
                "discount_percent": float(r.discount_percent) if r.discount_percent is not None else None,
                "price_override": float(r.price_override) if r.price_override is not None else None,
                "starts_at": r.starts_at.isoformat(),
                "ends_at": r.ends_at.isoformat(),
                "is_active": r.is_active,
            }
            for r in rows
        ]
    }


@router.patch("/{promotion_id}/toggle")
async def toggle_promotion(
    promotion_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    p = db.query(CoursePromotion).filter(CoursePromotion.id == promotion_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    c = db.query(Course).filter(Course.id == p.course_id, Course.teacher_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=403, detail="Forbidden")
    p.is_active = not p.is_active
    db.commit()
    return {"is_active": p.is_active}
