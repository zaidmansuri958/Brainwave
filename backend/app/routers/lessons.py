from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Lesson, Course
from app.models.enrollment import Enrollment
from app.models.progress import StudentProgress
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.services.storage_service import get_presigned_url
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(tags=["Lessons"])


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
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == lesson.course_id,
            Enrollment.is_active == True
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in this course")

    return {
        "master_url": lesson.video_url,
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
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
            Enrollment.is_active == True
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled")

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
