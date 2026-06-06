"""Teacher curriculum editing: chapters, lessons, quizzes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Any
import uuid

from app.database import get_db
from app.middleware.auth_middleware import get_current_teacher
from app.models.user import User
from app.models.course import Course, Chapter, Lesson
from app.models.quiz import Quiz, QuizQuestion

router = APIRouter(prefix="/teacher/curriculum", tags=["Curriculum"])


def _course_teacher(db: Session, course_id: str, user_id):
    c = db.query(Course).filter(Course.id == course_id, Course.teacher_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return c


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_free_preview: Optional[bool] = None


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None
    ai_summary: Optional[str] = None


class QuizQuestionIn(BaseModel):
    id: Optional[str] = None
    question_text: str
    question_type: str = "mcq"
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    order_index: Optional[int] = None


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    pass_percent: Optional[int] = None
    max_attempts: Optional[int] = None
    questions: Optional[List[QuizQuestionIn]] = None


@router.get("/courses/{course_id}")
async def get_curriculum_tree(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    chapters = db.query(Chapter).filter(Chapter.course_id == course_id).order_by(Chapter.order_index).all()
    result = []
    for ch in chapters:
        lessons = db.query(Lesson).filter(Lesson.chapter_id == ch.id).order_by(Lesson.order_index).all()
        quiz = db.query(Quiz).filter(Quiz.chapter_id == ch.id).first()
        result.append({
            "id": str(ch.id),
            "title": ch.title,
            "description": ch.description,
            "order_index": ch.order_index,
            "is_free_preview": ch.is_free_preview,
            "quiz_id": str(quiz.id) if quiz else None,
            "lessons": [
                {
                    "id": str(les.id),
                    "title": les.title,
                    "order_index": les.order_index,
                    "is_published": les.is_published,
                    "ai_summary": les.ai_summary,
                }
                for les in lessons
            ],
        })
    return {"course_id": course_id, "chapters": result}


class ChapterCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_free_preview: Optional[bool] = False


@router.post("/courses/{course_id}/chapters")
async def create_chapter(
    course_id: str,
    data: ChapterCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    max_index = db.query(Chapter).filter(Chapter.course_id == course_id).count()
    ch = Chapter(
        course_id=course_id,
        title=data.title,
        description=data.description,
        order_index=data.order_index if data.order_index is not None else max_index,
        is_free_preview=data.is_free_preview or False,
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return {"id": str(ch.id), "title": ch.title, "order_index": ch.order_index}


@router.delete("/courses/{course_id}/chapters/{chapter_id}")
async def delete_chapter(
    course_id: str,
    chapter_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    ch = db.query(Chapter).filter(Chapter.id == chapter_id, Chapter.course_id == course_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(ch)
    db.commit()
    return {"message": "Chapter deleted"}


class LessonCreate(BaseModel):
    chapter_id: str
    title: str
    order_index: Optional[int] = None


@router.post("/courses/{course_id}/lessons")
async def create_lesson(
    course_id: str,
    data: LessonCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    ch = db.query(Chapter).filter(Chapter.id == data.chapter_id, Chapter.course_id == course_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    max_index = db.query(Lesson).filter(Lesson.chapter_id == data.chapter_id).count()
    les = Lesson(
        chapter_id=data.chapter_id,
        course_id=course_id,
        title=data.title,
        order_index=data.order_index if data.order_index is not None else max_index,
        is_published=False,
    )
    db.add(les)
    db.commit()
    db.refresh(les)
    return {"id": str(les.id), "title": les.title, "order_index": les.order_index}


@router.delete("/courses/{course_id}/lessons/{lesson_id}")
async def delete_lesson(
    course_id: str,
    lesson_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    les = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(les)
    db.commit()
    return {"message": "Lesson deleted"}


class QuizCreate(BaseModel):
    chapter_id: Optional[str] = None
    lesson_id: Optional[str] = None
    title: str
    pass_percent: Optional[int] = 70
    max_attempts: Optional[int] = 3


@router.post("/courses/{course_id}/quizzes")
async def create_quiz(
    course_id: str,
    data: QuizCreate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    q = Quiz(
        course_id=course_id,
        chapter_id=data.chapter_id,
        lesson_id=data.lesson_id,
        title=data.title,
        pass_percent=data.pass_percent or 70,
        max_attempts=data.max_attempts or 3,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"id": str(q.id), "title": q.title}


@router.delete("/courses/{course_id}/quizzes/{quiz_id}")
async def delete_quiz(
    course_id: str,
    quiz_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    q = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.course_id == course_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(q)
    db.commit()
    return {"message": "Quiz deleted"}


@router.patch("/courses/{course_id}/chapters/{chapter_id}")
async def update_chapter(
    course_id: str,
    chapter_id: str,
    data: ChapterUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    ch = db.query(Chapter).filter(Chapter.id == chapter_id, Chapter.course_id == course_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Chapter not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(ch, k, v)
    db.commit()
    return {"message": "updated"}


@router.patch("/courses/{course_id}/lessons/{lesson_id}")
async def update_lesson(
    course_id: str,
    lesson_id: str,
    data: LessonUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    les = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(les, k, v)
    db.commit()
    return {"message": "updated"}


@router.get("/courses/{course_id}/quizzes")
async def list_course_quizzes(
    course_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    quizzes = db.query(Quiz).filter(Quiz.course_id == course_id).all()
    out = []
    for q in quizzes:
        out.append(
            {
                "id": str(q.id),
                "title": q.title,
                "chapter_id": str(q.chapter_id) if q.chapter_id else None,
                "lesson_id": str(q.lesson_id) if q.lesson_id else None,
                "pass_percent": q.pass_percent,
                "max_attempts": q.max_attempts,
                "questions": [
                    {
                        "id": str(qq.id),
                        "question_text": qq.question_text,
                        "question_type": qq.question_type,
                        "options": qq.options,
                        "correct_answer": qq.correct_answer,
                        "explanation": qq.explanation,
                        "order_index": qq.order_index,
                    }
                    for qq in sorted(q.questions, key=lambda x: x.order_index or 0)
                ],
            }
        )
    return {"quizzes": out}


@router.patch("/courses/{course_id}/quizzes/{quiz_id}")
async def update_quiz(
    course_id: str,
    quiz_id: str,
    data: QuizUpdate,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    _course_teacher(db, course_id, current_user.id)
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.course_id == course_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    if data.title is not None:
        quiz.title = data.title
    if data.pass_percent is not None:
        quiz.pass_percent = data.pass_percent
    if data.max_attempts is not None:
        quiz.max_attempts = data.max_attempts
    if data.questions is not None:
        db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).delete()
        for i, qin in enumerate(data.questions):
            qq = QuizQuestion(
                quiz_id=quiz.id,
                question_text=qin.question_text,
                question_type=qin.question_type,
                options=qin.options,
                correct_answer=qin.correct_answer,
                explanation=qin.explanation,
                order_index=qin.order_index if qin.order_index is not None else i,
                ai_generated=False,
            )
            db.add(qq)
    db.commit()
    return {"message": "updated"}
