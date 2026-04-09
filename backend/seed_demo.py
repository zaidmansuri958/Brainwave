"""
Demo seed for Brainwave.ai

Usage:
    docker compose exec backend python seed_demo.py

What it does:
    1. Ensures the base catalog from seed.py exists
    2. Creates one admin and several students
    3. Enrolls students into courses
    4. Creates completed payments, progress, quizzes, certificates, risks, and notifications

This script is intended to be idempotent.
"""

from __future__ import annotations

import os
import sys
import uuid
import random
import hashlib
import subprocess
from datetime import datetime, timedelta, timezone

try:
    import bcrypt as _bcrypt

    if not hasattr(_bcrypt, "__about__"):
        _about = type(sys)("bcrypt.__about__")
        _about.__version__ = _bcrypt.__version__
        _bcrypt.__about__ = _about
except Exception:
    pass

sys.path.insert(0, "/app")

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import SessionLocal
import app.models  # noqa: F401
from app.models.user import User
from app.models.course import Course, Chapter, Lesson
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.progress import StudentProgress
from app.models.certificate import Certificate
from app.models.notification import Notification
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt
from app.models.risk import StudentRiskScore

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN = {
    "email": "admin@brainwave.ai",
    "full_name": "Brainwave Admin",
    "password": "Admin@123",
    "role": "admin",
}

STUDENTS = [
    {"email": "aarya.shah@brainwave.ai", "full_name": "Aarya Shah", "password": "Student@123"},
    {"email": "rohan.verma@brainwave.ai", "full_name": "Rohan Verma", "password": "Student@123"},
    {"email": "meera.nair@brainwave.ai", "full_name": "Meera Nair", "password": "Student@123"},
    {"email": "kabir.singh@brainwave.ai", "full_name": "Kabir Singh", "password": "Student@123"},
    {"email": "sana.khan@brainwave.ai", "full_name": "Sana Khan", "password": "Student@123"},
]


def ensure_base_catalog() -> None:
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    seed_path = os.path.join(backend_dir, "seed.py")
    result = subprocess.run([sys.executable, seed_path], check=False)
    if result.returncode != 0:
        raise RuntimeError("Base seed.py failed. Fix that first, then rerun seed_demo.py.")


def upsert_user(db: Session, *, email: str, full_name: str, password: str, role: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user

    user = User(
        email=email,
        full_name=full_name,
        password_hash=pwd_ctx.hash(password),
        role=role,
        is_verified=True,
    )
    db.add(user)
    db.flush()
    return user


def ensure_quiz_for_chapter(db: Session, course: Course, chapter: Chapter) -> Quiz:
    quiz = db.query(Quiz).filter(Quiz.course_id == course.id, Quiz.chapter_id == chapter.id).first()
    if quiz:
        return quiz

    quiz = Quiz(
        course_id=course.id,
        chapter_id=chapter.id,
        title=f"{chapter.title} checkpoint",
        time_limit_minutes=12,
        max_attempts=3,
        pass_percent=60,
        show_leaderboard=True,
    )
    db.add(quiz)
    db.flush()

    prompts = [
        ("What is the key concept covered in this chapter?", ["Concept A", "Concept B", "Concept C", "Concept D"], "Concept A"),
        ("Which approach is usually the best starting point here?", ["First principles", "Guessing", "Skipping", "Memorizing only"], "First principles"),
        ("Why does this topic matter in practice?", ["It improves problem solving", "It removes all bugs", "It replaces teachers", "It avoids revision"], "It improves problem solving"),
    ]
    for index, (question_text, options, answer) in enumerate(prompts, start=1):
        db.add(
            QuizQuestion(
                quiz_id=quiz.id,
                question_text=question_text,
                question_type="mcq",
                options=options,
                correct_answer=answer,
                explanation="Seeded demo explanation.",
                order_index=index,
                ai_generated=True,
            )
        )
    return quiz


def ensure_payment(db: Session, student: User, course: Course, amount: float) -> Payment | None:
    if amount <= 0:
        return None

    payment = (
        db.query(Payment)
        .filter(Payment.payer_id == student.id, Payment.reference_id == course.id, Payment.status == "completed")
        .first()
    )
    if payment:
        return payment

    platform_cut = round(amount * 0.18, 2)
    teacher_earning = round(amount - platform_cut, 2)
    payment = Payment(
        payer_id=student.id,
        payee_id=course.teacher_id,
        payment_type="course_purchase",
        reference_id=course.id,
        razorpay_order_id=f"order_{uuid.uuid4().hex[:12]}",
        razorpay_payment_id=f"pay_{uuid.uuid4().hex[:12]}",
        total_amount=amount,
        platform_cut=platform_cut,
        platform_cut_percent_applied=18,
        teacher_earning=teacher_earning,
        currency="INR",
        status="completed",
    )
    db.add(payment)
    db.flush()
    return payment


def ensure_notification(db: Session, user_id, title: str, message: str, kind: str) -> None:
    existing = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.title == title, Notification.type == kind)
        .first()
    )
    if existing:
        return

    db.add(
        Notification(
            user_id=user_id,
            type=kind,
            title=title,
            message=message,
            extra_data={},
        )
    )


def ensure_certificate(db: Session, student: User, course: Course) -> None:
    existing = (
        db.query(Certificate)
        .filter(Certificate.student_id == student.id, Certificate.course_id == course.id)
        .first()
    )
    if existing:
        return

    cert_hash = hashlib.sha256(f"{student.id}:{course.id}".encode()).hexdigest()
    db.add(
        Certificate(
            student_id=student.id,
            course_id=course.id,
            teacher_id=course.teacher_id,
            certificate_pdf_url=f"https://cdn.brainwave.ai/certificates/{cert_hash[:16]}.pdf",
            certificate_hash=cert_hash,
        )
    )


def seed_demo() -> None:
    ensure_base_catalog()

    db: Session = SessionLocal()
    try:
        random.seed(7)

        admin = upsert_user(db, role=ADMIN["role"], email=ADMIN["email"], full_name=ADMIN["full_name"], password=ADMIN["password"])
        students = [
            upsert_user(db, role="student", email=item["email"], full_name=item["full_name"], password=item["password"])
            for item in STUDENTS
        ]
        db.commit()

        courses = db.query(Course).order_by(Course.created_at.asc()).all()
        if not courses:
            raise RuntimeError("No courses found after base seed.")

        for student_index, student in enumerate(students):
            chosen_courses = courses[student_index : student_index + 3] or courses[:3]
            for course_index, course in enumerate(chosen_courses):
                lessons = (
                    db.query(Lesson)
                    .filter(Lesson.course_id == course.id, Lesson.is_published == True)
                    .order_by(Lesson.order_index.asc())
                    .all()
                )
                if not lessons:
                    continue

                amount = float(course.price or 0)
                payment = ensure_payment(db, student, course, amount)

                enrollment = (
                    db.query(Enrollment)
                    .filter(Enrollment.student_id == student.id, Enrollment.course_id == course.id)
                    .first()
                )
                if not enrollment:
                    enrollment = Enrollment(
                        student_id=student.id,
                        course_id=course.id,
                        payment_id=payment.id if payment else None,
                        amount_paid=amount,
                        is_active=True,
                        access_type="lifetime",
                        access_starts_at=datetime.now(timezone.utc) - timedelta(days=30 + student_index * 4),
                    )
                    db.add(enrollment)
                    course.enrolled_count = int(course.enrolled_count or 0) + 1

                completion_target = min(len(lessons), max(1, len(lessons) - (student_index + course_index) % 4))
                for lesson_pos, lesson in enumerate(lessons):
                    completed = lesson_pos < completion_target
                    progress = (
                        db.query(StudentProgress)
                        .filter(StudentProgress.student_id == student.id, StudentProgress.lesson_id == lesson.id)
                        .first()
                    )
                    if not progress:
                        progress = StudentProgress(
                            student_id=student.id,
                            course_id=course.id,
                            lesson_id=lesson.id,
                        )
                        db.add(progress)
                    progress.watch_percent = 100 if completed else 35 + ((lesson_pos * 13) % 40)
                    progress.watch_duration_seconds = min((lesson.duration_seconds or 900), int((lesson.duration_seconds or 900) * progress.watch_percent / 100))
                    progress.completed = completed
                    progress.last_watched_at = datetime.now(timezone.utc) - timedelta(days=(len(lessons) - lesson_pos))

                first_chapter = (
                    db.query(Chapter)
                    .filter(Chapter.course_id == course.id)
                    .order_by(Chapter.order_index.asc())
                    .first()
                )
                if first_chapter:
                    quiz = ensure_quiz_for_chapter(db, course, first_chapter)
                    quiz_attempt = (
                        db.query(QuizAttempt)
                        .filter(QuizAttempt.student_id == student.id, QuizAttempt.quiz_id == quiz.id)
                        .first()
                    )
                    if not quiz_attempt:
                        answers = {str(q.id): q.correct_answer for q in quiz.questions}
                        db.add(
                            QuizAttempt(
                                student_id=student.id,
                                quiz_id=quiz.id,
                                answers=answers,
                                score_percent=80 + ((student_index + course_index) % 15),
                                passed=True,
                                time_taken_seconds=420,
                            )
                        )

                completion_ratio = completion_target / max(len(lessons), 1)
                risk_level = "low" if completion_ratio >= 0.8 else "medium" if completion_ratio >= 0.45 else "high"
                risk = (
                    db.query(StudentRiskScore)
                    .filter(StudentRiskScore.student_id == student.id, StudentRiskScore.course_id == course.id)
                    .first()
                )
                if not risk:
                    risk = StudentRiskScore(student_id=student.id, course_id=course.id)
                    db.add(risk)
                risk.risk_level = risk_level
                risk.risk_score = 0.18 if risk_level == "low" else 0.52 if risk_level == "medium" else 0.81
                risk.features_snapshot = {
                    "completion_ratio": round(completion_ratio, 2),
                    "student_index": student_index,
                    "course_index": course_index,
                }

                if completion_ratio >= 0.95 and course.certificate_enabled:
                    ensure_certificate(db, student, course)

                ensure_notification(
                    db,
                    student.id,
                    f"Continue learning: {course.title}",
                    "Your next lesson is ready and your dashboard now has demo progress.",
                    "learning_nudge",
                )
                ensure_notification(
                    db,
                    course.teacher_id,
                    f"New enrollment in {course.title}",
                    f"{student.full_name} is now enrolled.",
                    "new_enrollment",
                )

        db.commit()

        print("\nDemo seed complete.\n")
        print("Admin login")
        print(f"  {ADMIN['email']} / {ADMIN['password']}")
        print("\nStudent logins")
        for student in STUDENTS:
            print(f"  {student['email']} / {student['password']}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
