from tasks.celery_app import celery_app


@celery_app.task
def send_enrollment_email_task(student_name: str, student_email: str, course_title: str):
    from app.utils.email import send_enrollment_email
    send_enrollment_email(student_name, student_email, course_title)


@celery_app.task
def send_nudge_email_task(student_email: str, student_name: str, teacher_name: str, course_title: str):
    from app.utils.email import send_email
    send_email(
        to=student_email,
        subject=f"Message from your teacher - {course_title}",
        html=f"""
        <h2>Your teacher is rooting for you! 🌟</h2>
        <p>Hi {student_name},</p>
        <p><strong>{teacher_name}</strong> wants you to know they believe in you!</p>
        <p>Keep going with <strong>{course_title}</strong>. You're doing great!</p>
        <p>Log in and continue your journey: <a href="#">Open Course</a></p>
        """
    )


@celery_app.task
def send_payout_notification_task(teacher_email: str, teacher_name: str, amount: float):
    from app.utils.email import send_payout_notification
    send_payout_notification(teacher_email, teacher_name, amount)


@celery_app.task
def notify_teacher_processing_complete(course_id: str):
    from app.database import SessionLocal
    from app.models.course import Course
    from app.models.user import User
    from app.utils.email import send_email
    from app.config import settings

    db = SessionLocal()
    try:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return
        teacher = db.query(User).filter(User.id == course.teacher_id).first()
        if teacher:
            send_email(
                to=teacher.email,
                subject=f"Your course '{course.title}' is ready to review!",
                html=f"""
                <h2>AI Processing Complete! 🎉</h2>
                <p>Hi {teacher.full_name},</p>
                <p>Your course <strong>{course.title}</strong> has been processed by AI.</p>
                <p>We've created chapters, summaries, quiz questions, and a thumbnail.</p>
                <p>Please review and publish: <a href="{settings.frontend_url}/teacher/courses/{course_id}/review">Review Course</a></p>
                """
            )
    finally:
        db.close()


@celery_app.task
def send_live_session_reminders():
    """Send reminders 30 minutes before live sessions."""
    from app.database import SessionLocal
    from app.models.live_session import LiveSession
    from app.models.enrollment import Enrollment
    from app.models.user import User
    from app.utils.email import send_live_session_reminder
    from app.config import settings
    from datetime import datetime, timezone, timedelta

    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        reminder_window_start = now + timedelta(minutes=28)
        reminder_window_end = now + timedelta(minutes=32)

        upcoming = db.query(LiveSession).filter(
            LiveSession.scheduled_at >= reminder_window_start,
            LiveSession.scheduled_at <= reminder_window_end,
            LiveSession.status == "scheduled"
        ).all()

        for session in upcoming:
            enrollments = db.query(Enrollment).filter(
                Enrollment.course_id == session.course_id,
                Enrollment.is_active == True
            ).all()
            for e in enrollments:
                student = db.query(User).filter(User.id == e.student_id).first()
                if student:
                    jitsi_url = f"https://{settings.jitsi_domain}/{session.jitsi_room_name}"
                    send_live_session_reminder(student.email, student.full_name, session.title, jitsi_url)
    finally:
        db.close()
