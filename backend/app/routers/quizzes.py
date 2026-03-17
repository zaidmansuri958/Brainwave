from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.models.enrollment import Enrollment
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from datetime import datetime, timezone

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Check enrollment
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == quiz.course_id,
            Enrollment.is_active == True
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled")

    # Count attempts
    attempt_count = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id
    ).count()

    if attempt_count >= quiz.max_attempts:
        raise HTTPException(status_code=403, detail="Maximum attempts reached")

    questions = []
    for q in quiz.questions:
        questions.append({
            "id": str(q.id),
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "order_index": q.order_index
        })

    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "time_limit_minutes": quiz.time_limit_minutes,
        "max_attempts": quiz.max_attempts,
        "pass_percent": quiz.pass_percent,
        "attempts_used": attempt_count,
        "questions": questions
    }


@router.post("/{quiz_id}/attempt")
async def submit_quiz(
    quiz_id: str,
    answers: dict,
    time_taken_seconds: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    attempt_count = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id
    ).count()

    if attempt_count >= quiz.max_attempts:
        raise HTTPException(status_code=403, detail="Maximum attempts reached")

    # Grade the quiz
    questions = quiz.questions
    correct = 0
    correct_answers = {}
    explanations = {}

    for q in questions:
        correct_answers[str(q.id)] = q.correct_answer
        explanations[str(q.id)] = q.explanation or ""
        student_answer = answers.get(str(q.id), "")
        if q.question_type in ["mcq", "true_false"]:
            if student_answer.lower() == (q.correct_answer or "").lower():
                correct += 1
        elif q.question_type == "short_answer":
            correct += 0.5  # partial credit for short answers

    score_percent = (correct / len(questions) * 100) if questions else 0
    passed = score_percent >= quiz.pass_percent

    attempt = QuizAttempt(
        student_id=current_user.id,
        quiz_id=quiz_id,
        answers=answers,
        score_percent=round(score_percent, 2),
        passed=passed,
        time_taken_seconds=time_taken_seconds,
    )
    db.add(attempt)
    db.commit()

    return {
        "score_percent": round(score_percent, 2),
        "passed": passed,
        "correct_answers": correct_answers,
        "explanations": explanations,
        "attempt_number": attempt_count + 1
    }


@router.get("/{quiz_id}/leaderboard")
async def get_leaderboard(
    quiz_id: str,
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz or not quiz.show_leaderboard:
        raise HTTPException(status_code=404, detail="Leaderboard not available")

    from sqlalchemy import func
    best_attempts = db.query(
        QuizAttempt.student_id,
        func.max(QuizAttempt.score_percent).label("best_score")
    ).filter(QuizAttempt.quiz_id == quiz_id).group_by(QuizAttempt.student_id).order_by(
        func.max(QuizAttempt.score_percent).desc()
    ).limit(20).all()

    rankings = []
    for rank, (student_id, score) in enumerate(best_attempts, 1):
        student = db.query(User).filter(User.id == student_id).first()
        rankings.append({
            "rank": rank,
            "student_name": student.full_name if student else "Unknown",
            "score": float(score)
        })

    return {"rankings": rankings}
