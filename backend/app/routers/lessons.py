from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Lesson, Course
from app.models.enrollment import Enrollment
from app.models.progress import StudentProgress
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.utils.enrollment_access import get_valid_enrollment
from app.services.storage_service import get_presigned_url
from app.config import settings
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(tags=["Lessons"])


@router.get("/lessons/{lesson_id}/captions", response_class=PlainTextResponse)
async def get_lesson_captions(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return VTT captions for a lesson. Checks Redis first, then lesson.raw_transcript."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if current_user.role == "student":
        enrollment = get_valid_enrollment(db, current_user.id, str(lesson.course_id))
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled")

    # Try Redis cache first (stored by pipeline for each material)
    import redis as redis_lib
    import os
    try:
        rc = redis_lib.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
        # Search for any caption key for this course
        keys = rc.keys(f"captions:{lesson.course_id}:*")
        if keys:
            vtt = rc.get(keys[0])
            if vtt:
                return PlainTextResponse(vtt, media_type="text/vtt")
    except Exception:
        pass

    # Fallback: generate minimal VTT from raw_transcript
    if lesson.raw_transcript:
        vtt = f"WEBVTT\n\n1\n00:00:00.000 --> 00:00:10.000\n{lesson.raw_transcript[:200]}\n"
        return PlainTextResponse(vtt, media_type="text/vtt")

    raise HTTPException(status_code=404, detail="No captions available for this lesson")


@router.get("/lessons/{lesson_id}/video-url")
async def get_video_url(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Check enrollment (unless teacher)
    if current_user.role == "student":
        enrollment = get_valid_enrollment(db, current_user.id, str(lesson.course_id))
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled or access expired")

    # Hand out a short-lived presigned URL rather than the permanent public object URL,
    # so the enrollment check above actually gates access.
    master_url = lesson.video_url
    if master_url:
        prefix = settings.storage_public_url.rstrip("/") + "/"
        if master_url.startswith(prefix):
            bucket, _, key = master_url[len(prefix):].partition("/")
            if bucket and key:
                master_url = get_presigned_url(bucket, key, expiry=3600)

    return {
        "master_url": master_url,
        "qualities": ["480p", "720p", "1080p"]
    }


@router.get("/courses/{course_id}/lessons/{lesson_id}")
async def get_lesson(
    course_id: str,
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if current_user.role == "student":
        enrollment = get_valid_enrollment(db, current_user.id, course_id)
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled or access expired")

    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.lesson_id == lesson_id
    ).first()

    return {
        "id": str(lesson.id),
        "title": lesson.title,
        "lesson_type": lesson.lesson_type,
        "video_url": lesson.video_url,
        "document_url": lesson.document_url,
        "ai_summary": lesson.ai_summary,
        "duration_seconds": lesson.duration_seconds,
        "progress": {
            "watch_percent": progress.watch_percent if progress else 0,
            "completed": progress.completed if progress else False
        }
    }


@router.post("/courses/{course_id}/lessons/{lesson_id}/progress")
async def update_progress(
    course_id: str,
    lesson_id: str,
    watch_percent: int,
    watch_duration_seconds: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student":
        return {"message": "OK"}

    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.lesson_id == lesson_id
    ).first()

    if progress:
        if watch_percent > progress.watch_percent:
            if progress.watch_percent > 0:
                progress.rewatch_count += 1
            progress.watch_percent = watch_percent
            progress.watch_duration_seconds = max(progress.watch_duration_seconds, watch_duration_seconds)
        progress.last_watched_at = datetime.now(timezone.utc)
        if watch_percent >= 90:
            progress.completed = True
    else:
        progress = StudentProgress(
            student_id=current_user.id,
            course_id=course_id,
            lesson_id=lesson_id,
            watch_percent=watch_percent,
            watch_duration_seconds=watch_duration_seconds,
            last_watched_at=datetime.now(timezone.utc),
            completed=watch_percent >= 90
        )
        db.add(progress)

    db.commit()

    # Check if course is complete
    from app.models.course import Course, Lesson as LessonModel
    course = db.query(Course).filter(Course.id == course_id).first()
    if course and course.certificate_enabled:
        total_lessons = db.query(LessonModel).filter(LessonModel.course_id == course_id, LessonModel.is_published == True).count()
        completed_lessons = db.query(StudentProgress).filter(
            StudentProgress.student_id == current_user.id,
            StudentProgress.course_id == course_id,
            StudentProgress.completed == True
        ).count()
        if total_lessons > 0 and completed_lessons >= total_lessons * (course.completion_requirement_percent / 100):
            # Trigger certificate issuance
            from tasks.certificate_tasks import issue_certificate_task
            issue_certificate_task.delay(str(current_user.id), course_id)

    return {"message": "Progress updated", "completed": progress.completed}


@router.get("/courses/{course_id}/my-progress")
async def get_my_progress(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.models.course import Lesson as LessonModel
    from app.models.quiz import QuizAttempt, Quiz

    all_lessons = db.query(LessonModel).filter(
        LessonModel.course_id == course_id,
        LessonModel.is_published == True
    ).all()

    progress_records = db.query(StudentProgress).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.course_id == course_id
    ).all()

    progress_map = {str(p.lesson_id): p for p in progress_records}
    completed_count = sum(1 for p in progress_records if p.completed)
    total = len(all_lessons)
    overall_percent = round((completed_count / total * 100) if total > 0 else 0)

    lessons_progress = []
    for lesson in all_lessons:
        p = progress_map.get(str(lesson.id))
        lessons_progress.append({
            "lesson_id": str(lesson.id),
            "title": lesson.title,
            "completed": p.completed if p else False,
            "watch_percent": p.watch_percent if p else 0
        })

    return {
        "overall_percent": overall_percent,
        "lessons": lessons_progress,
    }
