# Patch bcrypt 4.x incompatibility with passlib (passlib reads __about__.__version__)
import sys as _sys
try:
    import bcrypt as _bcrypt
    if not hasattr(_bcrypt, '__about__'):
        _about = type(_sys)('bcrypt.__about__')
        _about.__version__ = _bcrypt.__version__
        _bcrypt.__about__ = _about
except Exception:
    pass

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import socketio
from sqlalchemy import text
import redis as redis_lib
import httpx

from app.database import engine, Base
from app.config import settings

# Import all models to ensure they're registered
import app.models

# Create tables only when explicitly enabled; production should rely on Alembic.
if settings.auto_create_tables:
    Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="Brainwave.ai API",
    description="AI-powered educational platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Rate limiting
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    limiter = Limiter(key_func=get_remote_address, storage_uri=settings.redis_url)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except Exception:
    pass

# Include all routers
from app.routers import (
    auth, courses, lessons, quizzes, enrollments,
    chat, community, certificates, live_sessions,
    doubt_sessions, notifications, teacher, admin,
    learning, curriculum, promotions, study_materials, mock_tests, availability,
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(courses.router, prefix=API_PREFIX)
app.include_router(lessons.router, prefix=API_PREFIX)
app.include_router(quizzes.router, prefix=API_PREFIX)
app.include_router(enrollments.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)
app.include_router(community.router, prefix=API_PREFIX)
app.include_router(certificates.router, prefix=API_PREFIX)
app.include_router(live_sessions.router, prefix=API_PREFIX)
app.include_router(doubt_sessions.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(teacher.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(learning.router, prefix=API_PREFIX)
app.include_router(curriculum.router, prefix=API_PREFIX)
app.include_router(promotions.router, prefix=API_PREFIX)
app.include_router(study_materials.router, prefix=API_PREFIX)
app.include_router(mock_tests.router, prefix=API_PREFIX)
app.include_router(availability.router, prefix=API_PREFIX)

# Razorpay webhook
@app.post("/api/v1/payments/webhook")
async def razorpay_webhook(request: Request):
    from app.services.payment_service import verify_webhook_signature
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    if not verify_webhook_signature(payload, signature):
        return JSONResponse(status_code=400, content={"error": "Invalid signature"})
    # Process webhook event
    import json
    data = json.loads(payload)
    event = data.get("event")
    print(f"Webhook event received: {event}")
    return {"status": "ok"}


# Refund request endpoint
@app.post("/api/v1/refunds/request")
async def request_refund(
    request: Request,
    enrollment_id: str = None,
    reason: str = None,
    description: str = None
):
    from app.middleware.auth_middleware import get_current_user
    from app.database import get_db
    from app.models.payment import Payment, RefundRequest
    from app.models.enrollment import Enrollment
    from app.models.progress import StudentProgress
    from sqlalchemy import func as sqlfunc
    from fastapi import Depends

    # Get auth token manually since we're in main.py
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})

    token = auth_header.split(" ")[1]
    from app.utils.jwt import verify_token
    try:
        payload = verify_token(token)
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})
    if not payload:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})

    user_id = payload.get("sub")
    if not user_id:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})

    db_gen = get_db()
    db = next(db_gen)
    try:
        enrollment = db.query(Enrollment).filter(
            Enrollment.id == enrollment_id,
            Enrollment.student_id == user_id,
            Enrollment.is_active == True
        ).first()
        if not enrollment:
            return JSONResponse(status_code=404, content={"detail": "Enrollment not found"})

        # Check no existing pending refund
        existing = db.query(RefundRequest).filter(
            RefundRequest.enrollment_id == enrollment_id,
            RefundRequest.status == "pending"
        ).first()
        if existing:
            return JSONResponse(status_code=400, content={"detail": "Refund already requested"})

        # Calculate watch percent
        from app.models.course import Lesson, Chapter
        total_lessons = db.query(sqlfunc.count(Lesson.id)).join(
            Chapter, Lesson.chapter_id == Chapter.id
        ).filter(Chapter.course_id == enrollment.course_id).scalar() or 1

        completed = db.query(sqlfunc.count(StudentProgress.id)).filter(
            StudentProgress.student_id == user_id,
            StudentProgress.course_id == enrollment.course_id,
            StudentProgress.completed == True
        ).scalar() or 0

        watch_pct = round(completed / total_lessons * 100, 2)

        # Find the payment for this enrollment
        payment = db.query(Payment).filter(
            Payment.reference_id == enrollment.course_id,
            Payment.payer_id == user_id,
            Payment.status == "completed"
        ).order_by(Payment.created_at.desc()).first()

        refund = RefundRequest(
            student_id=user_id,
            enrollment_id=enrollment_id,
            payment_id=payment.id if payment else None,
            reason=reason,
            description=description,
            watch_percent_at_request=watch_pct,
            status="pending"
        )
        db.add(refund)
        db.commit()
        db.refresh(refund)
        return {"refund_request_id": str(refund.id), "status": "pending", "watch_percent": watch_pct}
    finally:
        db.close()


@app.get("/api/v1/platform/stats")
async def platform_stats():
    from app.database import get_db
    from app.models.user import User
    from app.models.course import Course
    from app.models.enrollment import Enrollment
    from app.models.review import Review
    from sqlalchemy import func as sqlfunc

    db_gen = get_db()
    db = next(db_gen)
    try:
        student_count = db.query(sqlfunc.count(User.id)).filter(User.role == "student").scalar() or 0
        teacher_count = db.query(sqlfunc.count(User.id)).filter(User.role == "teacher").scalar() or 0
        course_count = db.query(sqlfunc.count(Course.id)).filter(Course.status == "published").scalar() or 0
        avg_rating = db.query(sqlfunc.avg(Course.avg_rating)).filter(
            Course.status == "published", Course.avg_rating > 0
        ).scalar() or 0
        return {
            "students": int(student_count),
            "teachers": int(teacher_count),
            "courses": int(course_count),
            "avg_rating": round(float(avg_rating), 1),
        }
    finally:
        db.close()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "Brainwave.ai Backend",
        "environment": settings.environment,
    }


@app.get("/ready")
async def ready():
    checks = {
        "database": False,
        "redis": False,
        "ai_service": False,
    }

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        pass

    try:
        redis_client = redis_lib.from_url(settings.redis_url, decode_responses=True)
        redis_client.ping()
        checks["redis"] = True
    except Exception:
        pass

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{settings.ai_service_url}/health")
            checks["ai_service"] = response.status_code == 200
    except Exception:
        pass

    overall = all(checks.values())
    status_code = 200 if overall else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if overall else "degraded",
            "checks": checks,
        },
    )


@app.get("/")
async def root():
    return {"message": "Brainwave.ai API", "docs": "/api/docs"}


# Socket.IO integration
from websocket.socket_manager import sio

socket_app = socketio.ASGIApp(sio, app)

# For running directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
