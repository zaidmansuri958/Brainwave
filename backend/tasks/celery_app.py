from celery import Celery
from celery.schedules import crontab
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "brainwave",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "tasks.ai_pipeline",
        "tasks.risk_scoring",
        "tasks.certificate_tasks",
        "tasks.email_tasks",
        "tasks.video_processing",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# Scheduled tasks
celery_app.conf.beat_schedule = {
    "nightly-risk-scoring": {
        "task": "tasks.risk_scoring.compute_all_risk_scores",
        "schedule": crontab(hour=2, minute=0),  # 2 AM every day
    },
    "live-session-reminders": {
        "task": "tasks.email_tasks.send_live_session_reminders",
        "schedule": crontab(minute="*/5"),  # Every 5 minutes
    },
}
