"""LLM-based content moderation for course title + body text."""
import os
import json
import re

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


async def moderate_course_content(title: str, category: str, body_text: str, file_names: list = None) -> dict:
    """
    Returns:
      { "allowed": bool, "severity": "low"|"high", "reasons": [str], "raw_label": str }
    """
    names = ", ".join(file_names or [])
    snippet = (body_text or "")[:12000]
    block_hits = []
    lowered = f"{title} {snippet}".lower()
    for bad in ("bomb-making", "how to hack", "ransomware toolkit", "child porn", "terrorist"):
        if bad in lowered:
            block_hits.append(f"blocked_term:{bad}")

    if GEMINI_API_KEY and GEMINI_API_KEY not in ("", "your_gemini_api_key_here"):
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            prompt = f"""You are a content safety reviewer for an educational platform.
Evaluate if this course is appropriate to publish (no illegal hacking instructions, no hate, no sexual content involving minors, no violence promotion).
The course must be consistent: title/category should match the teaching content (e.g. not "Politics" title with unrelated science-only content is misleading — flag as inconsistent).

Title: {title}
Category: {category}
File names: {names}
Content excerpt:
{snippet}

Reply with ONLY valid JSON: {{"allowed": true or false, "severity": "low" or "high", "reasons": ["short reason"]}}"""
            resp = model.generate_content(prompt)
            text = (resp.text or "").strip()
            m = re.search(r"\{[\s\S]*\}", text)
            if m:
                data = json.loads(m.group())
                allowed = bool(data.get("allowed", False))
                return {
                    "allowed": allowed and not block_hits,
                    "severity": data.get("severity", "high" if not allowed else "low"),
                    "reasons": list(data.get("reasons", [])) + block_hits,
                    "raw_label": "gemini",
                }
        except Exception as e:
            print(f"Gemini moderation failed: {e}")

    # Fallback: blocklist only
    if block_hits:
        return {"allowed": False, "severity": "high", "reasons": block_hits, "raw_label": "blocklist"}
    if len(snippet.strip()) < 20:
        return {"allowed": True, "severity": "low", "reasons": ["minimal_text_skipped"], "raw_label": "heuristic"}
    return {"allowed": True, "severity": "low", "reasons": [], "raw_label": "heuristic_ok"}
