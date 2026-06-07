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
import random

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])


class ChatMessage(BaseModel):
    message: str


# ── Built-in fallback responses (used when ai-services is unavailable) ─────────
_RESPONSES = {
    "concept": [
        "Great question! This is one of the foundational ideas in the course. The key is to understand *why* it works, not just *how*. Every concept builds on the previous one — take it step by step and use small examples to verify your understanding before scaling up. Would you like me to walk through a specific part?",
        "Let me explain this clearly. The core idea is about applying a systematic approach: identify your inputs and desired outputs, apply the relevant rules, then validate. Most learners skip the validation step — that's where bugs and misunderstandings creep in. Does that help?",
    ],
    "summary": [
        "Here's a quick overview: the course starts with foundations, then moves to core techniques with hands-on exercises, and finishes with applied projects. By the end you'll have practical skills and real examples for your portfolio. Which module would you like to go deeper on?",
    ],
    "quiz": [
        "Sure! Here's a quick question to test your understanding: Can you explain the main concept from this lesson in 1-2 sentences without using any jargon? If you can do that, you've truly understood it. Give it a try!",
        "Let's test your knowledge! Think about the most important takeaway from this lesson. How would you apply it to a real-world problem you've encountered? Explaining it in your own words is the best way to check comprehension.",
    ],
    "example": [
        "Great — real-world examples make everything click! This concept appears constantly in industry: tech companies use it in day-to-day engineering, startups rely on it to move fast, and freelancers use it to deliver better results. The key insight is that applying it methodically saves hours of debugging and rework. What type of project are you working on?",
    ],
    "flashcard": [
        "Here are some quick flashcard prompts for this lesson:\n\n**Q:** What is the main purpose of this concept?\n**Q:** What are the 2-3 key steps involved?\n**Q:** What's a common mistake to avoid?\n**Q:** How would you explain this to someone with no background?\n\nTry answering each one before checking the lesson notes!",
    ],
    "interview": [
        "Good thinking to prepare for interviews! Interviewers love questions about this topic. Common questions include:\n\n• 'Explain [concept] in simple terms'\n• 'What are the trade-offs of this approach?'\n• 'How would you handle [edge case]?'\n• 'Walk me through your thought process'\n\nThe key is to think out loud and structure your answer: define the concept, explain how it works, give an example, mention limitations.",
    ],
    "default": [
        "That's a great question! The key insight here is to focus on understanding the *pattern* rather than memorising specific steps. When you encounter this type of problem: (1) identify what you're given and what you need, (2) look for the underlying pattern, (3) apply it and verify. Would you like me to elaborate on any specific part?",
        "I'm glad you asked — this is an important concept. The course approaches it from first principles, which means instead of just showing *what* to do, it explains *why* it works that way. That deeper understanding is what separates people who can only follow tutorials from people who can build things independently. What part would you like me to clarify?",
        "Good question! Try this: after finishing the lesson, explain this concept out loud to yourself in plain English with no jargon. If you can do that clearly, you've understood it. If you stumble, that's exactly where to re-watch. Would you like a quick recap of the key points?",
    ],
}


def _fallback_response(question: str, course_name: str) -> str:
    q = question.lower()
    if any(w in q for w in ["what is", "explain", "define", "how does", "describe", "tell me"]):
        pool = _RESPONSES["concept"]
    elif any(w in q for w in ["summary", "overview", "cover", "topics", "what do", "what will"]):
        pool = _RESPONSES["summary"]
    elif any(w in q for w in ["quiz", "test", "question", "practice"]):
        pool = _RESPONSES["quiz"]
    elif any(w in q for w in ["example", "real world", "application", "use case", "industry", "project"]):
        pool = _RESPONSES["example"]
    elif any(w in q for w in ["flashcard", "flash card", "memorize", "remember"]):
        pool = _RESPONSES["flashcard"]
    elif any(w in q for w in ["interview", "job", "career", "hire"]):
        pool = _RESPONSES["interview"]
    else:
        pool = _RESPONSES["default"]
    resp = random.choice(pool)
    return resp.replace("this course", f"**{course_name}**", 1)


# ── Route ───────────────────────────────────────────────────────────────────────
@router.post("/{course_id}/message")
async def chat_message(
    course_id: str,
    body: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
        response_text = None
        sources = []

        # ── Try AI service first ──────────────────────────────────────────────
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    f"{settings.ai_service_url}/chat",
                    json={"course_id": course_id, "course_name": course.title, "question": body.message}
                )
                data = resp.json()
                response_text = data.get("response")
                sources = data.get("sources", [])
        except Exception:
            pass  # Fall through to built-in fallback

        # ── Built-in fallback (always works) ─────────────────────────────────
        if not response_text:
            response_text = _fallback_response(body.message, course.title)

        # ── Stream word-by-word ───────────────────────────────────────────────
        words = response_text.split(" ")
        for i, word in enumerate(words):
            chunk = {"token": word + (" " if i < len(words) - 1 else "")}
            yield f"data: {json.dumps(chunk)}\n\n"

        yield f"data: {json.dumps({'sources': sources, 'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/{course_id}/history")
async def get_chat_history(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"messages": []}
