"""Shared Gemini REST client.

Uses the REST API with the `X-goog-api-key` header (works with both the classic
`AIza...` keys and the newer `AQ...` keys) instead of the pinned/old google-generativeai
SDK. Default model is configurable via GEMINI_MODEL and defaults to a current flash model
(gemini-2.0-flash is quota-blocked on many keys, so we avoid it)."""
import os
import json
import re
import time
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def gemini_available() -> bool:
    return bool(GEMINI_API_KEY) and GEMINI_API_KEY not in ("", "your_gemini_api_key_here")


def generate_text(prompt: str, *, json_mode: bool = False, model: str = None, timeout: float = 60.0) -> str:
    """Call Gemini generateContent and return the raw text. Raises on transport/HTTP error."""
    mdl = model or GEMINI_MODEL
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    if json_mode:
        body["generationConfig"] = {"response_mime_type": "application/json"}
    # Retry on 429 (free-tier rate limits) with exponential backoff.
    last_exc = None
    for attempt in range(3):
        resp = httpx.post(
            f"{_BASE}/{mdl}:generateContent",
            headers={"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY},
            json=body,
            timeout=timeout,
        )
        if resp.status_code == 429 and attempt < 2:
            time.sleep(5 * (attempt + 1))
            continue
        resp.raise_for_status()
        data = resp.json()
        parts = data["candidates"][0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts).strip()
    resp.raise_for_status()  # exhausted retries on 429
    raise last_exc or RuntimeError("Gemini request failed")


def generate_json(prompt: str, *, model: str = None, timeout: float = 90.0) -> dict:
    """Call Gemini in JSON mode and return a parsed dict. Raises if parsing fails."""
    text = generate_text(prompt, json_mode=True, model=model, timeout=timeout)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            return json.loads(m.group())
        raise
