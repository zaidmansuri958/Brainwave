from tasks.celery_app import celery_app


@celery_app.task
def issue_certificate_task(student_id: str, course_id: str):
    """Issue a certificate to a student who completed a course."""
    from app.database import SessionLocal
    from app.services.certificate_service import issue_certificate
    from app.services.notification_service import create_notification
    from app.models.user import User
    from app.models.course import Course
    from app.config import settings

    db = SessionLocal()
    try:
        cert = issue_certificate(db, student_id, course_id)

        student = db.query(User).filter(User.id == student_id).first()
        course = db.query(Course).filter(Course.id == course_id).first()

        if student and course:
            create_notification(
                db, student_id, "certificate_issued",
                "Certificate Issued!",
                f"Congratulations! Your certificate for {course.title} is ready.",
                {"certificate_id": str(cert.id), "course_id": course_id}
            )

            verify_url = f"{settings.frontend_url}/verify/{str(cert.id)}"
            from app.utils.email import send_certificate_email
            send_certificate_email(
                student.full_name,
                student.email,
                course.title,
                verify_url,
                cert.certificate_pdf_url or ""
            )
    except Exception as e:
        print(f"Certificate issuance failed: {e}")
    finally:
        db.close()
