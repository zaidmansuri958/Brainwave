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

    from gemini_client import gemini_available, generate_json
    if gemini_available():
        try:
            prompt = f"""You are a content safety reviewer for an educational platform.
Evaluate if this course is appropriate to publish (no illegal hacking instructions, no hate, no sexual content involving minors, no violence promotion).
The course must be consistent: title/category should match the teaching content (e.g. not "Politics" title with unrelated science-only content is misleading — flag as inconsistent).

Title: {title}
Category: {category}
File names: {names}
Content excerpt:
{snippet}

Reply with ONLY valid JSON: {{"allowed": true or false, "severity": "low" or "high", "reasons": ["short reason"]}}"""
            data = generate_json(prompt, timeout=60)
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
