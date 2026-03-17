from tasks.celery_app import celery_app
from datetime import datetime, timezone


@celery_app.task
def compute_all_risk_scores():
    """Run nightly to compute student risk scores for all active enrollments."""
    from app.database import SessionLocal
    from app.models.enrollment import Enrollment
    from app.models.progress import StudentProgress
    from app.models.quiz import QuizAttempt, Quiz
    from app.models.community import CommunityPost
    from app.models.risk import StudentRiskScore
    from app.models.user import User
    from app.models.course import Course, Lesson
    from app.services.notification_service import create_notification
    from sqlalchemy import func
    import numpy as np

    db = SessionLocal()
    try:
        enrollments = db.query(Enrollment).filter(Enrollment.is_active == True).all()

        for enrollment in enrollments:
            try:
                features = compute_features(db, enrollment)
                risk_result = predict_risk(features)

                # Upsert risk score
                existing = db.query(StudentRiskScore).filter(
                    StudentRiskScore.student_id == enrollment.student_id,
                    StudentRiskScore.course_id == enrollment.course_id
                ).first()

                if existing:
                    existing.risk_level = risk_result["risk_level"]
                    existing.risk_score = risk_result["risk_score"]
                    existing.computed_at = datetime.now(timezone.utc)
                    existing.features_snapshot = features
                    if risk_result["risk_level"] == "high" and not existing.teacher_notified:
                        notify_teacher_at_risk(db, enrollment)
                        existing.teacher_notified = True
                else:
                    risk = StudentRiskScore(
                        student_id=enrollment.student_id,
                        course_id=enrollment.course_id,
                        risk_level=risk_result["risk_level"],
                        risk_score=risk_result["risk_score"],
                        features_snapshot=features
                    )
                    db.add(risk)
                    if risk_result["risk_level"] == "high":
                        notify_teacher_at_risk(db, enrollment)
                        risk.teacher_notified = True

                db.commit()
            except Exception as e:
                print(f"Risk scoring failed for enrollment {enrollment.id}: {e}")
                db.rollback()

    finally:
        db.close()


def compute_features(db, enrollment) -> dict:
    from app.models.progress import StudentProgress
    from app.models.quiz import QuizAttempt, Quiz
    from app.models.community import CommunityPost
    from app.models.course import Lesson
    from sqlalchemy import func

    student_id = enrollment.student_id
    course_id = enrollment.course_id

    # Watch data
    progress_records = db.query(StudentProgress).filter(
        StudentProgress.student_id == student_id,
        StudentProgress.course_id == course_id
    ).all()

    avg_watch_percent = 0
    rewatch_rate = 0
    completion_rate = 0
    last_active_days = 999

    if progress_records:
        avg_watch_percent = sum(p.watch_percent for p in progress_records) / len(progress_records)
        rewatch_rate = sum(p.rewatch_count for p in progress_records) / len(progress_records)
        total_lessons = db.query(func.count(Lesson.id)).filter(Lesson.course_id == course_id).scalar() or 1
        completed = sum(1 for p in progress_records if p.completed)
        completion_rate = completed / total_lessons

        last_watched = max((p.last_watched_at for p in progress_records if p.last_watched_at), default=None)
        if last_watched:
            last_active_days = (datetime.now(timezone.utc) - last_watched.replace(tzinfo=timezone.utc)).days

    # Quiz performance
    from app.models.quiz import QuizAttempt
    quiz_attempts = db.query(QuizAttempt).join(
        Quiz, QuizAttempt.quiz_id == Quiz.id
    ).filter(
        QuizAttempt.student_id == student_id,
        Quiz.course_id == course_id
    ).all()

    quiz_avg_score = 0
    if quiz_attempts:
        quiz_avg_score = sum(float(a.score_percent or 0) for a in quiz_attempts) / len(quiz_attempts) / 100

    # Community activity
    community_posts = db.query(func.count(CommunityPost.id)).filter(
        CommunityPost.course_id == course_id,
        CommunityPost.author_id == student_id
    ).scalar() or 0

    enrollment_days = (datetime.now(timezone.utc) - enrollment.enrolled_at.replace(tzinfo=timezone.utc)).days

    return {
        "avg_watch_percent": avg_watch_percent / 100,
        "rewatch_rate": min(rewatch_rate / 10, 1.0),
        "quiz_avg_score": quiz_avg_score,
        "days_since_last_active": last_active_days,
        "completion_rate": completion_rate,
        "community_posts_count": community_posts,
        "assignment_submit_rate": 0.5,  # placeholder
        "enrollment_days": enrollment_days
    }


def predict_risk(features: dict) -> dict:
    """Simple rule-based risk prediction (replace with ML model in production)."""
    score = 0

    # High inactivity = high risk
    days_inactive = features.get("days_since_last_active", 0)
    if days_inactive > 14:
        score += 0.4
    elif days_inactive > 7:
        score += 0.2

    # Low completion rate = risk
    completion = features.get("completion_rate", 0)
    if completion < 0.2:
        score += 0.3
    elif completion < 0.5:
        score += 0.1

    # Low quiz scores = risk
    quiz_score = features.get("quiz_avg_score", 0)
    if quiz_score < 0.3:
        score += 0.2
    elif quiz_score < 0.5:
        score += 0.1

    # Low watch percent = risk
    watch = features.get("avg_watch_percent", 0)
    if watch < 0.3:
        score += 0.1

    score = min(score, 1.0)

    if score < 0.3:
        risk_level = "low"
    elif score < 0.65:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {"risk_score": round(score, 4), "risk_level": risk_level}


def notify_teacher_at_risk(db, enrollment):
    from app.models.user import User
    from app.models.course import Course
    from app.services.notification_service import create_notification

    student = db.query(User).filter(User.id == enrollment.student_id).first()
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not student or not course:
        return

    create_notification(
        db, str(course.teacher_id), "student_at_risk",
        "Student At Risk of Dropping",
        f"{student.full_name} is at high risk of dropping {course.title}",
        {"student_id": str(student.id), "course_id": str(course.id)}
    )

    from app.utils.email import send_at_risk_notification
    teacher = db.query(User).filter(User.id == course.teacher_id).first()
    if teacher:
        send_at_risk_notification(teacher.email, teacher.full_name, student.full_name, course.title)
