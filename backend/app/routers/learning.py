"""Student chapter access (module gating by quiz)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.course import Course, Chapter, Lesson
from app.models.enrollment import Enrollment
from app.models.progress import StudentProgress
from app.models.quiz import Quiz, QuizAttempt
from app.utils.enrollment_access import get_valid_enrollment

router = APIRouter(prefix="/learn", tags=["Learning"])


def _prev_chapter_quiz_passed(db: Session, student_id, course_id: str, prev_chapter: Chapter) -> bool:
    q = db.query(Quiz).filter(Quiz.chapter_id == prev_chapter.id, Quiz.course_id == course_id).first()
    if not q:
        return True
    att = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.student_id == student_id, QuizAttempt.quiz_id == q.id)
        .order_by(QuizAttempt.attempted_at.desc())
        .first()
    )
    return bool(att and att.passed)


def _chapter_lessons_completed(db: Session, student_id, course_id: str, chapter: Chapter) -> bool:
    lessons = db.query(Lesson).filter(Lesson.chapter_id == chapter.id, Lesson.is_published == True).all()
    if not lessons:
        return True
    for les in lessons:
        pr = (
            db.query(StudentProgress)
            .filter(
                StudentProgress.student_id == student_id,
                StudentProgress.lesson_id == les.id,
                StudentProgress.completed == True,
            )
            .first()
        )
        if not pr:
            return False
    return True


@router.get("/courses/{slug}/progress")
async def get_course_progress(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = get_valid_enrollment(db, current_user.id, str(course.id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled or access expired")

    progress_rows = db.query(StudentProgress).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.course_id == course.id,
    ).all()

    total_lessons = db.query(func.count(Lesson.id)).join(
        Chapter, Lesson.chapter_id == Chapter.id
    ).filter(Chapter.course_id == course.id, Lesson.is_published == True).scalar() or 0

    completed_lesson_ids = [str(p.lesson_id) for p in progress_rows if p.completed]
    last_watched = max(
        (p for p in progress_rows if p.last_watched_at),
        key=lambda p: p.last_watched_at,
        default=None
    )

    return {
        "course_id": str(course.id),
        "completed_lesson_ids": completed_lesson_ids,
        "last_lesson_id": str(last_watched.lesson_id) if last_watched else None,
        "last_position_seconds": last_watched.watch_duration_seconds if last_watched else 0,
        "overall_percent": round(len(completed_lesson_ids) / total_lessons * 100) if total_lessons else 0,
        "total_lessons": total_lessons,
    }


class ProgressWrite(BaseModel):
    lesson_id: str
    completed: Optional[bool] = False
    watch_position_seconds: Optional[int] = 0


@router.post("/courses/{slug}/progress")
async def write_course_progress(
    slug: str,
    data: ProgressWrite,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = get_valid_enrollment(db, current_user.id, str(course.id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled or access expired")

    from datetime import datetime, timezone
    existing = db.query(StudentProgress).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.lesson_id == data.lesson_id,
        StudentProgress.course_id == course.id,
    ).first()

    if existing:
        if data.completed:
            existing.completed = True
        if data.watch_position_seconds:
            existing.watch_duration_seconds = data.watch_position_seconds
        existing.last_watched_at = datetime.now(timezone.utc)
    else:
        existing = StudentProgress(
            student_id=current_user.id,
            lesson_id=data.lesson_id,
            course_id=course.id,
            completed=data.completed or False,
            watch_duration_seconds=data.watch_position_seconds or 0,
            last_watched_at=datetime.now(timezone.utc),
        )
        db.add(existing)

    db.commit()
    return {"message": "Progress recorded"}


@router.get("/courses/{slug}/access")
async def get_course_learn_access(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")

    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = get_valid_enrollment(db, current_user.id, str(course.id))
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled or access expired")

    chapters = db.query(Chapter).filter(Chapter.course_id == course.id).order_by(Chapter.order_index).all()
    out = []
    lock = False
    for i, ch in enumerate(chapters):
        if i == 0:
            unlocked = True
        else:
            prev = chapters[i - 1]
            if course.module_lock_enabled:
                prev_done = _chapter_lessons_completed(db, current_user.id, str(course.id), prev)
                prev_quiz = _prev_chapter_quiz_passed(db, current_user.id, str(course.id), prev)
                unlocked = prev_done and prev_quiz
            else:
                unlocked = True
        if not unlocked:
            lock = True
        quiz = db.query(Quiz).filter(Quiz.chapter_id == ch.id).first()
        prev_q = db.query(Quiz).filter(Quiz.chapter_id == chapters[i - 1].id).first() if i > 0 else None
        out.append(
            {
                "chapter_id": str(ch.id),
                "title": ch.title,
                "order_index": ch.order_index,
                "unlocked": unlocked,
                "quiz_id": str(quiz.id) if quiz else None,
                "required_quiz_id": str(prev_q.id) if (not unlocked and prev_q) else None,
            }
        )

    return {
        "course_id": str(course.id),
        "slug": course.slug,
        "module_lock_enabled": course.module_lock_enabled,
        "default_access_months": course.default_access_months,
        "access": {
            "type": getattr(enrollment, "access_type", None) or "lifetime",
            "expires_at": enrollment.access_expires_at.isoformat() if enrollment.access_expires_at else None,
        },
        "chapters": out,
    }
