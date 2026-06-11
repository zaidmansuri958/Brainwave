import httpx
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:8b")

SYSTEM_PROMPT = """You are an expert AI tutor for the course "{course_name}".
Your job is to help students understand the course material clearly and concisely.

Guidelines:
- Answer questions directly and clearly
- Use simple language and concrete examples
- When relevant, structure your answer with bullet points or numbered steps
- Keep answers focused — don't over-explain
- If you don't know something specific about the course, give a helpful general answer
- Be encouraging and supportive
"""


async def chat(course_id: str, course_name: str, question: str) -> dict:
    system = SYSTEM_PROMPT.format(course_name=course_name)

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": question},
                    ],
                    "stream": False,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data.get("message", {}).get("content", "").strip()
                if text:
                    return {"response": text, "sources": []}
    except Exception as e:
        print(f"[Chatbot] Ollama error: {e}")

    # Fallback when Ollama is unavailable
    return {
        "response": (
            f"I'm your AI tutor for **{course_name}**. "
            "The AI model is currently warming up — please try again in a moment. "
            "In the meantime, feel free to review the lesson transcript or post in the community forum."
        ),
        "sources": [],
    }
