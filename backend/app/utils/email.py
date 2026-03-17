import resend
from app.config import settings

resend.api_key = settings.resend_api_key


def send_email(to: str, subject: str, html: str):
    try:
        resend.Emails.send({
            "from": f"{settings.platform_name} <{settings.platform_email}>",
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception as e:
        print(f"Email send failed: {e}")


def send_enrollment_email(student_name: str, student_email: str, course_title: str):
    send_email(
        to=student_email,
        subject=f"You're enrolled in {course_title}!",
        html=f"""
        <h2>Welcome to {course_title}!</h2>
        <p>Hi {student_name},</p>
        <p>You have successfully enrolled in <strong>{course_title}</strong>.</p>
        <p>Start learning now on <a href="{settings.frontend_url}">{settings.platform_name}</a>.</p>
        """
    )


def send_certificate_email(student_name: str, student_email: str, course_title: str, cert_url: str, pdf_url: str):
    send_email(
        to=student_email,
        subject=f"Your Certificate for {course_title}",
        html=f"""
        <h2>Congratulations, {student_name}!</h2>
        <p>You have successfully completed <strong>{course_title}</strong>.</p>
        <p><a href="{cert_url}">View your certificate</a></p>
        <p><a href="{pdf_url}">Download PDF</a></p>
        """
    )


def send_live_session_reminder(student_email: str, student_name: str, session_title: str, jitsi_url: str):
    send_email(
        to=student_email,
        subject=f"Live Session Starting Soon: {session_title}",
        html=f"""
        <h2>Your live session starts in 30 minutes!</h2>
        <p>Hi {student_name},</p>
        <p>The session <strong>{session_title}</strong> starts soon.</p>
        <p><a href="{jitsi_url}">Join Now</a></p>
        """
    )


def send_at_risk_notification(teacher_email: str, teacher_name: str, student_name: str, course_title: str):
    send_email(
        to=teacher_email,
        subject=f"Student At Risk: {student_name}",
        html=f"""
        <h2>Student Dropout Alert</h2>
        <p>Hi {teacher_name},</p>
        <p><strong>{student_name}</strong> is at high risk of dropping your course <strong>{course_title}</strong>.</p>
        <p>Login to your dashboard to send an encouragement message.</p>
        <p><a href="{settings.frontend_url}/teacher/dashboard">View Dashboard</a></p>
        """
    )


def send_payout_notification(teacher_email: str, teacher_name: str, amount: float):
    send_email(
        to=teacher_email,
        subject=f"Payout of ₹{amount} Processed",
        html=f"""
        <h2>Payout Processed</h2>
        <p>Hi {teacher_name},</p>
        <p>Your payout of <strong>₹{amount}</strong> has been processed and will be credited to your bank account.</p>
        """
    )
