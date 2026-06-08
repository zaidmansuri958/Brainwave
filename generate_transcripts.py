"""
Brainwave -- Transcript Generator
===================================
Calls the AI service to transcribe each lesson video and saves the
transcript + summary back to the database.

Usage:
    python generate_transcripts.py [--course-id <id>] [--lesson-id <id>]

The AI service (port 8001) must be running.
This can take 5-15 minutes per video on CPU -- run in a terminal and leave it.
"""

import sys
import subprocess
import json
import time
import argparse

# Auto-install requests if needed
try:
    import requests
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "requests", "-q"])
    import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Config ────────────────────────────────────────────────────────────────────
AI_SERVICE_URL   = "http://localhost:8001"
DOCKER_POSTGRES  = "brainwave-postgres-1"
# Videos are stored with localhost:9000 but the AI service needs the Docker-internal URL
MINIO_EXTERNAL   = "http://localhost:9000"
MINIO_INTERNAL   = "http://minio:9000"   # URL the AI service container uses


def to_internal_url(url: str) -> str:
    return url.replace(MINIO_EXTERNAL, MINIO_INTERNAL)


# ── DB helpers ────────────────────────────────────────────────────────────────
def psql(sql: str):
    r = subprocess.run(
        ["docker", "exec", DOCKER_POSTGRES, "psql", "-U", "postgres", "-d", "brainwave",
         "-t", "-A", "-c", sql],
        capture_output=True, text=True
    )
    return r.stdout.strip()


def get_lessons_with_video(course_id=None, lesson_id=None):
    where = "l.video_url IS NOT NULL AND l.video_url != ''"
    if lesson_id:
        where += f" AND l.id = '{lesson_id}'"
    if course_id:
        where += f" AND l.course_id = '{course_id}'"
    # Only lessons without a transcript yet
    where += " AND (l.raw_transcript IS NULL OR l.raw_transcript = '')"

    sql = f"""
    SELECT l.id, l.title, l.video_url, c.title as course_title
    FROM lessons l
    JOIN courses c ON c.id = l.course_id
    WHERE {where}
    ORDER BY c.title, l.order_index;
    """
    output = psql(sql)
    lessons = []
    for line in output.splitlines():
        parts = line.split("|")
        if len(parts) >= 4:
            lessons.append({
                "id": parts[0].strip(),
                "title": parts[1].strip(),
                "video_url": parts[2].strip(),
                "course_title": parts[3].strip(),
            })
    return lessons


def save_transcript(lesson_id: str, text: str, summary: str):
    # Escape single quotes
    text_esc    = text.replace("'", "''")[:50000]   # cap at 50k chars
    summary_esc = summary.replace("'", "''")[:2000]
    sql = (
        f"UPDATE lessons SET "
        f"raw_transcript='{text_esc}', "
        f"ai_summary='{summary_esc}' "
        f"WHERE id='{lesson_id}';"
    )
    r = subprocess.run(
        ["docker", "exec", DOCKER_POSTGRES, "psql", "-U", "postgres", "-d", "brainwave", "-c", sql],
        capture_output=True, text=True
    )
    return r.returncode == 0


def summarize(text: str, title: str) -> str:
    """Generate a simple extractive summary from the first N sentences."""
    sentences = [s.strip() for s in text.replace("\n", " ").split(".") if len(s.strip()) > 20]
    intro = ". ".join(sentences[:4]) + "." if sentences else ""
    return f"Summary of '{title}':\n\n{intro}" if intro else title


# ── Transcribe one lesson ─────────────────────────────────────────────────────
def transcribe_lesson(lesson: dict) -> bool:
    lesson_id  = lesson["id"]
    title      = lesson["title"]
    video_url  = lesson["video_url"]
    internal   = to_internal_url(video_url)

    print(f"\n[TRANSCRIBE] {title}")
    print(f"   URL: {internal}")

    t0 = time.time()
    try:
        resp = requests.post(
            f"{AI_SERVICE_URL}/transcribe",
            json={"file_url": internal, "material_id": lesson_id, "language": "en"},
            timeout=1200,  # 20 min max per video
        )
    except requests.exceptions.ConnectionError:
        print("   [FAIL] Cannot connect to AI service at", AI_SERVICE_URL)
        return False
    except requests.exceptions.Timeout:
        print("   [FAIL] Transcription timed out (>20 min)")
        return False

    elapsed = int(time.time() - t0)

    if resp.status_code != 200:
        print(f"   [FAIL] HTTP {resp.status_code}: {resp.text[:200]}")
        return False

    data = resp.json()
    text = data.get("text", "").strip()
    if not text:
        print("   [WARN] Empty transcript returned")
        return False

    summary = summarize(text, title)
    ok = save_transcript(lesson_id, text, summary)
    word_count = len(text.split())
    print(f"   [OK]  {word_count} words transcribed in {elapsed}s, saved to DB")
    return ok


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate AI transcripts for Brainwave lessons")
    parser.add_argument("--course-id",  help="Only process lessons in this course ID")
    parser.add_argument("--lesson-id",  help="Only process this single lesson ID")
    parser.add_argument("--dry-run",    action="store_true", help="List lessons but don't transcribe")
    args = parser.parse_args()

    # Check AI service is reachable
    try:
        ping = requests.get(f"{AI_SERVICE_URL}/health", timeout=5)
        print(f"[OK]  AI service reachable (status {ping.status_code})")
    except Exception:
        print(f"[FAIL] Cannot reach AI service at {AI_SERVICE_URL}")
        print("       Make sure Docker is running: docker compose up ai-services")
        sys.exit(1)

    lessons = get_lessons_with_video(
        course_id=args.course_id,
        lesson_id=args.lesson_id,
    )

    if not lessons:
        print("[OK]  No pending lessons found (all already have transcripts, or no video_url set)")
        return

    print(f"\n[PLAN] {len(lessons)} lessons to transcribe:")
    for l in lessons:
        size_hint = ""
        print(f"   - [{l['course_title'][:30]}] {l['title'][:50]}")

    if args.dry_run:
        print("\n[DRY RUN] Not transcribing. Remove --dry-run to process.")
        return

    print(f"\n[START] Processing {len(lessons)} lessons (this will take a while on CPU)...")
    print("        Each 10-min video takes ~2-5 min to transcribe. You can Ctrl+C to stop.\n")

    success = 0
    failed  = 0
    for i, lesson in enumerate(lessons, 1):
        print(f"[{i}/{len(lessons)}]", end=" ")
        ok = transcribe_lesson(lesson)
        if ok:
            success += 1
        else:
            failed += 1

    print(f"\n[DONE] {success} transcribed, {failed} failed")


if __name__ == "__main__":
    main()
