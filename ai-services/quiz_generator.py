import httpx
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")

QUIZ_PROMPT = """You are an expert educator creating quiz questions.
Based on the following lesson content, generate {num_questions} quiz questions.

Content:
{content}

Return ONLY valid JSON:
{{
  "questions": [
    {{
      "question_text": "Question here?",
      "question_type": "mcq",
      "options": [
        {{"id": "a", "text": "Option A"}},
        {{"id": "b", "text": "Option B"}},
        {{"id": "c", "text": "Option C"}},
        {{"id": "d", "text": "Option D"}}
      ],
      "correct_answer": "a",
      "explanation": "Why A is correct"
    }}
  ]
}}

Rules:
- Make questions test understanding, not just memory
- Each question must have exactly 4 options for MCQ
- Include the explanation for each answer
- Vary difficulty across questions"""


async def generate_quiz(lesson_content: str, num_questions: int = 5, language: str = None) -> dict:
    """Generate quiz questions from lesson content using Llama 3."""
    lang_note = ""
    if language:
        lang_note = f"\n\nWrite questions and options in: {language}."
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "llama3:8b",
                    "prompt": QUIZ_PROMPT.format(
                        content=lesson_content[:4000],
                        num_questions=num_questions
                    )
                    + lang_note,
                    "stream": False,
                    "format": "json"
                }
            )
            if resp.status_code == 200:
                response_text = resp.json().get("response", "{}")
                if isinstance(response_text, str):
                    return json.loads(response_text)
                return response_text
    except Exception as e:
        print(f"Quiz generation error: {e}")

    # Fallback
    return {
        "questions": [
            {
                "question_text": "What is the main topic of this lesson?",
                "question_type": "mcq",
                "options": [
                    {"id": "a", "text": "The main concept"},
                    {"id": "b", "text": "Something else"},
                    {"id": "c", "text": "Not related"},
                    {"id": "d", "text": "None of the above"}
                ],
                "correct_answer": "a",
                "explanation": "This is the core topic of the lesson."
            }
        ]
    }
