import io
import os
from PIL import Image, ImageDraw

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


async def generate_thumbnail(
    title: str,
    category: str,
    description: str,
    lesson_title: str = None,
    module_title: str = None,
    faculty_face_image_url: str = None,
    custom_prompt: str = None,
) -> bytes:
    return generate_placeholder_thumbnail(title, category)


async def generate_with_gemini(
    title: str,
    category: str,
    description: str,
    lesson_title: str = None,
    module_title: str = None,
    faculty_face_image_url: str = None,
    custom_prompt: str = None,
) -> bytes:
    """Generate a thumbnail via the Imagen REST API (`:predict`).

    NOTE: Imagen image generation requires a billing-enabled Google project; on free-tier
    keys this returns 404/429 and the caller falls back to the PIL placeholder. Using REST
    (not the pinned old SDK, which lacks ImageGenerationModel) so this works as soon as a
    paid key is supplied. Model is configurable via IMAGEN_MODEL."""
    import base64
    import httpx

    extra = ""
    if lesson_title:
        extra += f" Lesson focus: {lesson_title}."
    if module_title:
        extra += f" Module: {module_title}."
    if faculty_face_image_url:
        extra += " Style should suggest a professional instructor-led course (no need to depict a specific face)."
    if custom_prompt:
        extra += f" User request: {custom_prompt}"

    prompt = f"""Create a professional educational course thumbnail.
    Course: {title}
    Subject: {category}
    Description: {description[:500]}
    {extra}
    Style: Modern, vibrant colors, clean design. No text. 16:9 aspect ratio."""

    model = os.getenv("IMAGEN_MODEL", "imagen-3.0-generate-002")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predict"
    resp = httpx.post(
        url,
        headers={"Content-Type": "application/json", "X-goog-api-key": GEMINI_API_KEY},
        json={"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1, "aspectRatio": "16:9"}},
        timeout=120,
    )
    resp.raise_for_status()
    preds = resp.json().get("predictions", [])
    b64 = preds[0].get("bytesBase64Encoded") if preds else None
    if not b64:
        raise RuntimeError("Imagen returned no image bytes")
    return base64.b64decode(b64)



def generate_placeholder_thumbnail(title: str, category: str) -> bytes:
    width, height = 1280, 720

    colors = {
        "Mathematics": ("#1e40af", "#3b82f6"),
        "Physics": ("#7c3aed", "#a78bfa"),
        "Chemistry": ("#065f46", "#10b981"),
        "Biology": ("#064e3b", "#34d399"),
        "Programming": ("#1e3a5f", "#60a5fa"),
        "History": ("#78350f", "#f59e0b"),
        "English": ("#831843", "#f472b6"),
        "default": ("#312e81", "#6366f1"),
    }

    bg_color, accent = colors.get(category, colors["default"])

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    for y in range(height):
        ratio = y / height
        r1, g1, b1 = int(bg_color[1:3], 16), int(bg_color[3:5], 16), int(bg_color[5:7], 16)
        r2, g2, b2 = int(accent[1:3], 16), int(accent[3:5], 16), int(accent[5:7], 16)
        r = int(r1 + (r2 - r1) * ratio * 0.3)
        g = int(g1 + (g2 - g1) * ratio * 0.3)
        b = int(b1 + (b2 - b1) * ratio * 0.3)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    draw.ellipse([width - 300, -100, width + 100, 300], fill=accent + "40", outline=None)
    draw.ellipse([-100, height - 200, 200, height + 100], fill=accent + "30", outline=None)

    draw.rectangle([60, 60, 60 + len(category) * 14 + 30, 100], fill=accent, outline=None)
    draw.text((75, 68), category, fill="white")

    words = title.split()
    lines, current = [], ""
    for word in words:
        test = (current + " " + word).strip()
        if len(test) > 30:
            lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)

    y_pos = height // 2 - len(lines) * 40
    for line in lines[:4]:
        draw.text((60, y_pos), line, fill="white")
        y_pos += 60

    draw.text((60, height - 60), "Brainwave.ai", fill="#ffffff80")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
