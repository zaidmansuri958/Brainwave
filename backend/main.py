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

from app.database import engine, Base
from app.config import settings

# Import all models to ensure they're registered
import app.models

# Create tables
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
    doubt_sessions, notifications, teacher, admin
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
    # Simple implementation
    return {"refund_request_id": "pending", "status": "pending"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Brainwave.ai Backend"}


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
