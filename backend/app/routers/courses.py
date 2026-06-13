from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models.course import Course, Chapter, Lesson, CourseMaterial
from app.models.enrollment import Enrollment
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse, CourseListResponse,
    AIStatusResponse, MaterialUploadResponse, CourseStructureApproval
)
from app.middleware.auth_middleware import get_current_user, get_current_teacher, get_current_verified_teacher
from app.models.user import User
from app.services.storage_service import upload_file
from app.services.notification_service import create_notification
import uuid
import re
from typing import List, Optional
import redis as redis_lib
from app.config import settings

router = APIRouter(prefix="/courses", tags=["Courses"])
redis_client = redis_lib.from_url(settings.redis_url, decode_responses=True)


def generate_slug(title: str) -> str:
    slug = re.sub(r"[^a-z0-9\s-]", "", title.lower())
    slug = re.sub(r"[\s]+", "-", slug)
    return slug + "-" + str(uuid.uuid4())[:8]


@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    rows = db.query(Course.category, func.count(Course.id).label("count")).filter(
        Course.status == "published",
        Course.category != None,
    ).group_by(Course.category).order_by(func.count(Course.id).desc()).all()
    return {"categories": [{"name": r.category, "count": r.count} for r in rows]}


@router.get("", response_model=CourseListResponse)
async def list_courses(
    category: Optional[str] = None,
    search: Optional[str] = None,
    language: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rating: Optional[float] = None,
    level: Optional[str] = None,
    sort: str = "popular",
    page: int = 1,
    limit: int = 12,
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.status == "published")

    if search:
        query = query.filter(
            or_(
                Course.title.ilike(f"%{search}%"),
                Course.description.ilike(f"%{search}%"),
            )
        )
    if category:
        query = query.filter(Course.category == category)
    if language:
        query = query.filter(Course.language == language)
    if min_price is not None:
        query = query.filter(Course.price >= min_price)
    if max_price is not None:
        query = query.filter(Course.price <= max_price)
    if rating:
        query = query.filter(Course.avg_rating >= rating)
    if level:
        query = query.filter(Course.difficulty_level == level)

    sort_map = {
        "popular": Course.enrolled_count.desc(),
        "newest": Course.created_at.desc(),
        "price_asc": Course.price.asc(),
        "price_desc": Course.price.desc(),
        "rating": Course.avg_rating.desc(),
    }
    query = query.order_by(sort_map.get(sort, Course.enrolled_count.desc()))

    total = query.count()
    courses = query.offset((page - 1) * limit).limit(limit).all()
    pages = (total + limit - 1) // limit

    return CourseListResponse(
        courses=[CourseResponse.from_orm(c) for c in courses],
        total=total,
        page=page,
        pages=pages
    )


@router.get("/featured")
async def get_featured_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).filter(
        Course.status == "published",
        Course.is_featured == True
    ).limit(6).all()
    return {"courses": [CourseResponse.from_orm(c) for c in courses]}


@router.get("/search")
async def search_courses(
    q: Optional[str] = None,
    level: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: str = "relevance",
    max_price: Optional[float] = None,
    limit: int = 24,
    db: Session = Depends(get_db),
):
    """Full course search for the site search page. Declared BEFORE /{slug} so the
    literal path isn't captured by the slug route."""
    query = db.query(Course).filter(Course.status == "published")

    if q:
        query = query.filter(
            or_(
                Course.title.ilike(f"%{q}%"),
                Course.description.ilike(f"%{q}%"),
                Course.short_description.ilike(f"%{q}%"),
                Course.category.ilike(f"%{q}%"),
            )
        )
    if level:
        query = query.filter(Course.difficulty_level == level)
    if category:
        query = query.filter(Course.category.ilike(f"%{category}%"))
    if max_price is not None:
        query = query.filter(Course.price <= max_price)

    sort_map = {
        "relevance": Course.enrolled_count.desc(),
        "newest": Course.created_at.desc(),
        "rating": Course.avg_rating.desc(),
        "popular": Course.enrolled_count.desc(),
        "price_asc": Course.price.asc(),
        "price_desc": Course.price.desc(),
    }
    query = query.order_by(sort_map.get(sort_by, Course.enrolled_count.desc()))

    total = query.count()
    courses = query.limit(limit).all()
    return {"courses": [CourseResponse.from_orm(c) for c in courses], "total": total}


@router.get("/{slug}")
async def get_course(slug: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    from app.utils.pricing import effective_course_price
    from fastapi.encoders import jsonable_encoder
    eff = effective_course_price(db, course)
    base = float(course.price)
    discount_pct = round((1 - eff / base) * 100) if base > 0 and eff < base else 0
    data = jsonable_encoder(CourseResponse.from_orm(course))
    data["effective_price"] = eff
    data["discount_percent"] = discount_pct
    data["updated_at"] = course.updated_at.isoformat() if course.updated_at else None
    return data


@router.post("", response_model=CourseResponse)
async def create_course(
    data: CourseCreate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db)
):
    slug = generate_slug(data.title)
    course = Course(
        teacher_id=current_user.id,
        title=data.title,
        slug=slug,
        description=data.description,
        short_description=data.short_description,
        price=data.price,
        category=data.category,
        difficulty_level=data.difficulty_level,
        language=data.language,
        tags=data.tags,
        completion_requirement_percent=data.completion_requirement_percent,
        quiz_pass_percent=data.quiz_pass_percent,
        certificate_enabled=data.certificate_enabled,
        delivery_mode=data.delivery_mode or "video_course",
        default_access_months=data.default_access_months,
        module_lock_enabled=data.module_lock_enabled if data.module_lock_enabled is not None else True,
        transcript_language=(data.transcript_language.strip() if data.transcript_language else None),
        status="draft",
        ai_processing_status="pending",
        moderation_status="pending",
        content_validation_status="pending",
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseResponse.from_orm(course)


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    data: CourseUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for field, value in data.dict(exclude_none=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return CourseResponse.from_orm(course)


@router.delete("/{course_id}")
async def archive_course(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.status = "archived"
    db.commit()
    return {"message": "Course archived"}


@router.post("/{course_id}/archive")
async def archive_course_post(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.status = "archived"
    db.commit()
    return {"message": "Course archived"}


@router.post("/{course_id}/publish")
async def publish_course(
    course_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.ai_processing_status not in ("completed", "approved"):
        raise HTTPException(status_code=400, detail="AI processing must complete before publishing.")
    if course.content_validation_status != "approved" or course.moderation_status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Content must pass validation and moderation before publishing.",
        )
    course.status = "published"
    db.commit()
    return {"message": "Course published", "course_id": str(course_id)}


MAX_VIDEO_BYTES = 4 * 1024 * 1024 * 1024  # 4 GB
MAX_VIDEO_DURATION_SEC = 4 * 60 * 60  # 4 hours


def _probe_video_duration_seconds(content: bytes, filename: str) -> Optional[float]:
    """Best-effort duration via ffprobe if available."""
    import subprocess
    import tempfile
    import os
    suf = os.path.splitext(filename)[1] or ".mp4"
    try:
        with tempfile.NamedTemporaryFile(suffix=suf, delete=False) as tmp:
            tmp.write(content)
            path = tmp.name
        r = subprocess.run(
            [
                "ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1", path,
            ],
            capture_output=True,
            text=True,
            timeout=60,
        )
        os.unlink(path)
        if r.returncode == 0 and r.stdout.strip():
            return float(r.stdout.strip())
    except Exception:
        pass
    return None


@router.post("/{course_id}/materials/upload", response_model=MaterialUploadResponse)
async def upload_materials(
    course_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    upload_ids = []
    material_ids = []

    for file in files:
        content = await file.read()
        if len(content) > MAX_VIDEO_BYTES:
            raise HTTPException(status_code=400, detail=f"File too large (max {MAX_VIDEO_BYTES // (1024*1024)} MB)")
        ct = file.content_type or ""
        if "video" in ct:
            dur = _probe_video_duration_seconds(content, file.filename or "video.mp4")
            if dur is not None and dur > MAX_VIDEO_DURATION_SEC:
                raise HTTPException(
                    status_code=400,
                    detail="Video exceeds maximum length of 30 minutes",
                )
        file_key = f"courses/{course_id}/{uuid.uuid4()}/{file.filename}"
        file_url = upload_file(content, "course-materials", file_key, file.content_type or "application/octet-stream")

        file_type = "video"
        if file.content_type:
            if "video" in file.content_type:
                file_type = "video"
            elif "audio" in file.content_type:
                file_type = "audio"
            elif "pdf" in file.content_type:
                file_type = "pdf"
            elif "presentation" in file.content_type or "powerpoint" in file.content_type:
                file_type = "ppt"
            elif "word" in file.content_type or "document" in file.content_type:
                file_type = "doc"

        material = CourseMaterial(
            course_id=course_id,
            file_name=file.filename,
            file_type=file_type,
            file_url=file_url,
            file_size_bytes=len(content),
            processing_status="pending"
        )
        db.add(material)
        db.flush()
        upload_ids.append(str(material.id))
        material_ids.append(str(material.id))

    course.status = "processing"
    course.ai_processing_status = "processing"
    db.commit()

    # Trigger Celery AI pipeline
    from tasks.ai_pipeline import process_course_material
    task = process_course_material.delay(course_id, material_ids)

    return MaterialUploadResponse(
        upload_ids=upload_ids,
        task_id=task.id,
        message="Files uploaded. AI processing started."
    )


@router.post("/{course_id}/retry-ai")
async def retry_ai_pipeline(
    course_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    mats = db.query(CourseMaterial).filter(CourseMaterial.course_id == course_id).all()
    ids = [str(m.id) for m in mats]
    if not ids:
        raise HTTPException(status_code=400, detail="No materials to process")
    from tasks.ai_pipeline import process_course_material

    course.ai_processing_status = "processing"
    db.commit()
    task = process_course_material.delay(course_id, ids)
    return {"task_id": task.id, "message": "Pipeline re-queued"}


@router.get("/{course_id}/ai-status", response_model=AIStatusResponse)
async def get_ai_status(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    status_data = redis_client.hgetall(f"ai_status:{course_id}")

    return AIStatusResponse(
        video_processing={
            "status": status_data.get("video_status", "pending"),
            "progress_percent": int(status_data.get("video_progress", 0)),
            "qualities_ready": status_data.get("qualities_ready", "").split(",") if status_data.get("qualities_ready") else []
        },
        ai_processing={
            "status": course.ai_processing_status,
            "progress_percent": int(status_data.get("ai_progress", 0)),
            "steps_completed": status_data.get("steps_completed", "").split(",") if status_data.get("steps_completed") else []
        },
        error=status_data.get("error")
    )


@router.post("/{course_id}/structure/approve")
async def approve_course_structure(
    course_id: str,
    data: CourseStructureApproval,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if data.approved:
        course.ai_processing_status = "approved"
        db.commit()

    return {"message": "Course structure approved", "course_id": course_id}


@router.get("/{course_id}/reviews")
async def get_course_reviews(course_id: str, db: Session = Depends(get_db)):
    from app.models.review import Review
    from sqlalchemy import func

    reviews = db.query(Review).filter(Review.course_id == course_id).order_by(Review.created_at.desc()).all()
    avg = db.query(func.avg(Review.rating)).filter(Review.course_id == course_id).scalar() or 0

    return {
        "avg_rating": round(float(avg), 2),
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": str(r.id),
                "student_id": str(r.student_id),
                "student_name": r.student.full_name if r.student else "Anonymous",
                "student_avatar": r.student.avatar_url if r.student else None,
                "rating": r.rating,
                "review_text": r.review_text,
                "created_at": r.created_at.isoformat()
            }
            for r in reviews
        ]
    }


@router.post("/{course_id}/reviews")
async def submit_review(
    course_id: str,
    rating: int = Form(...),
    review_text: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.review import Review
    from app.models.enrollment import Enrollment

    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id,
        Enrollment.is_active == True
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="You must be enrolled to review")

    existing = db.query(Review).filter(Review.student_id == current_user.id, Review.course_id == course_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this course")

    review = Review(student_id=current_user.id, course_id=course_id, rating=rating, review_text=review_text)
    db.add(review)

    # Update course avg rating
    course = db.query(Course).filter(Course.id == course_id).first()
    all_reviews = db.query(Review).filter(Review.course_id == course_id).all()
    all_ratings = [r.rating for r in all_reviews] + [rating]
    course.avg_rating = round(sum(all_ratings) / len(all_ratings), 2)
    course.review_count = len(all_ratings)

    db.commit()
    return {"message": "Review submitted"}


@router.patch("/{course_id}/reviews/{review_id}")
async def update_review(
    course_id: str,
    review_id: str,
    rating: int = Form(None),
    review_text: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.review import Review
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.course_id == course_id,
        Review.student_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if rating is not None:
        review.rating = rating
    if review_text is not None:
        review.review_text = review_text
    # Recompute avg
    course = db.query(Course).filter(Course.id == course_id).first()
    all_reviews = db.query(Review).filter(Review.course_id == course_id).all()
    all_ratings = [r.rating for r in all_reviews]
    if all_ratings:
        course.avg_rating = round(sum(all_ratings) / len(all_ratings), 2)
    db.commit()
    return {"message": "Review updated"}


@router.delete("/{course_id}/reviews/{review_id}")
async def delete_review(
    course_id: str,
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.review import Review
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.course_id == course_id,
        Review.student_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    # Recompute avg
    course = db.query(Course).filter(Course.id == course_id).first()
    remaining = db.query(Review).filter(Review.course_id == course_id).all()
    if remaining:
        course.avg_rating = round(sum(r.rating for r in remaining) / len(remaining), 2)
        course.review_count = len(remaining)
    else:
        course.avg_rating = 0
        course.review_count = 0
    db.commit()
    return {"message": "Review deleted"}
