from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.config import settings
import httpx
import json

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


class ChatMessage(BaseModel):
    message: str


@router.post("/{course_id}/message")
async def chat_message(
    course_id: str,
    body: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Teachers and admins can always use the chatbot
    if current_user.role not in ("teacher", "admin"):
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
            Enrollment.is_active == True
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="You must be enrolled to use the AI chatbot")

    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    async def generate():
        try:
            async with httpx.AsyncClient(timeout=600) as client:
                resp = await client.post(
                    f"{settings.ai_service_url}/chat",
                    json={
                        "course_id": course_id,
                        "course_name": course.title,
                        "question": body.message
                    }
                )
                data = resp.json()
                response_text = data.get("response", "Sorry, I could not find an answer.")
                sources = data.get("sources", [])

                words = response_text.split(" ")
                for i, word in enumerate(words):
                    chunk = {"token": word + (" " if i < len(words) - 1 else "")}
                    yield f"data: {json.dumps(chunk)}\n\n"

                yield f"data: {json.dumps({'sources': sources, 'done': True})}\n\n"

        except Exception as e:
            error_msg = "The AI service is currently unavailable. Please try again later."
            yield f"data: {json.dumps({'token': error_msg, 'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/{course_id}/history")
async def get_chat_history(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"messages": []}
