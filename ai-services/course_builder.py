import httpx
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")

COURSE_STRUCTURE_PROMPT = """You are an expert curriculum designer.
Given the following raw transcript/content from a teacher, structure it into a proper course.

Content:
{content}

Return ONLY valid JSON in this exact format:
{{
  "course_title": "suggested title",
  "course_description": "2-3 sentence description",
  "short_description": "1 sentence tagline",
  "tags": ["tag1", "tag2"],
  "difficulty_level": "beginner",
  "chapters": [
    {{
      "title": "Chapter title",
      "description": "Chapter overview",
      "order": 1,
      "lessons": [
        {{
          "title": "Lesson title",
          "summary": "What this lesson covers",
          "key_concepts": ["concept1", "concept2"],
          "order": 1
        }}
      ]
    }}
  ]
}}"""


async def structure_course(transcript: str, language: str = None) -> dict:
    """Structure raw transcript into course chapters/lessons. Prefers Gemini (fast cloud);
    falls back to local Llama 3, then to a minimal hardcoded structure."""
    lang_note = ""
    if language:
        lang_note = f"\n\nWrite all titles, descriptions, and lesson text in: {language}."

    # Primary: Gemini (avoids slow local llama3 on CPU)
    from gemini_client import gemini_available, generate_json
    if gemini_available():
        try:
            data = generate_json(COURSE_STRUCTURE_PROMPT.format(content=transcript[:8000]) + lang_note, timeout=90)
            if data.get("chapters"):
                return data
        except Exception as e:
            print(f"Gemini structuring failed, falling back to llama3: {e}")

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "llama3:8b",
                    "prompt": COURSE_STRUCTURE_PROMPT.format(content=transcript[:8000]) + lang_note,
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
        print(f"Course structuring error: {e}")

    # Fallback structure
    return {
        "course_title": "Course",
        "course_description": "AI-generated course",
        "short_description": "Learn with AI",
        "tags": ["education"],
        "difficulty_level": "beginner",
        "chapters": [
            {
                "title": "Chapter 1: Introduction",
                "description": "Course introduction",
                "order": 1,
                "lessons": [
                    {
                        "title": "Lesson 1: Getting Started",
                        "summary": "Introduction to the course",
                        "key_concepts": [],
                        "order": 1
                    }
                ]
            }
        ]
    }
