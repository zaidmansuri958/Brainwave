"""
Brainwave — Bulk Video Uploader
================================
Uploads all MP4 files from a local folder to the System Design course.

Usage:
    python upload_course_videos.py

Requirements:
    pip install requests
"""

import os
import sys
import glob
import requests
import json

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Config ─────────────────────────────────────────────────────────────────────
API_BASE     = "http://localhost:8000/api/v1"
VIDEO_DIR    = r"D:\beginner"
COURSE_SLUG  = "system-design-software-engineers"
TEACHER_EMAIL    = "arjun.mehta@brainwave.ai"
TEACHER_PASSWORD = "Teacher@123"

# ── Auth ───────────────────────────────────────────────────────────────────────
def login():
    print("[AUTH]  Logging in as", TEACHER_EMAIL, "...")
    r = requests.post(f"{API_BASE}/auth/login", json={
        "email": TEACHER_EMAIL, "password": TEACHER_PASSWORD
    })
    if r.status_code != 200:
        print(f"[FAIL]  Login failed: {r.status_code} — {r.text}")
        sys.exit(1)
    token = r.json()["access_token"]
    print("[OK]  Logged in.")
    return token

# ── Get course ID ──────────────────────────────────────────────────────────────
def get_course_id(token):
    print(f"\n[FIND]  Looking up course '{COURSE_SLUG}' ...")
    r = requests.get(f"{API_BASE}/courses/{COURSE_SLUG}",
                     headers={"Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        print(f"[FAIL]  Course not found: {r.status_code} — {r.text}")
        sys.exit(1)
    course_id = r.json()["id"]
    print(f"[OK]  Course ID: {course_id}")
    return course_id

# ── Upload single file ─────────────────────────────────────────────────────────
def upload_file(token, course_id, filepath):
    filename = os.path.basename(filepath)
    size_mb  = os.path.getsize(filepath) / (1024 * 1024)
    print(f"   [UP]  {filename}  ({size_mb:.1f} MB)", end="", flush=True)

    with open(filepath, "rb") as f:
        r = requests.post(
            f"{API_BASE}/courses/{course_id}/materials/upload",
            headers={"Authorization": f"Bearer {token}"},
            files=[("files", (filename, f, "video/mp4"))],
            timeout=300,  # 5-minute timeout per file
        )

    if r.status_code == 200:
        print(" [OK]")
        return True
    else:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        print(f" [FAIL]  {r.status_code}: {detail}")
        return False

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  Brainwave — Course Video Uploader")
    print("=" * 60)

    # Find all MP4 files (sorted by filename)
    mp4_files = sorted(glob.glob(os.path.join(VIDEO_DIR, "*.mp4")))
    if not mp4_files:
        print(f"[FAIL]  No MP4 files found in {VIDEO_DIR}")
        sys.exit(1)

    print(f"\nFound {len(mp4_files)} MP4 files in {VIDEO_DIR}")
    total_size = sum(os.path.getsize(f) for f in mp4_files) / (1024 * 1024 * 1024)
    print(f"Total size: {total_size:.2f} GB")

    # Auth + course lookup
    token     = login()
    course_id = get_course_id(token)

    # Upload loop
    print(f"\n[START]  Uploading {len(mp4_files)} files...\n")
    success_count = 0
    failed_files  = []

    for i, filepath in enumerate(mp4_files, 1):
        print(f"[{i:02d}/{len(mp4_files)}]", end=" ")
        ok = upload_file(token, course_id, filepath)
        if ok:
            success_count += 1
        else:
            failed_files.append(os.path.basename(filepath))

    # Summary
    print("\n" + "=" * 60)
    print(f"  [OK]  {success_count} / {len(mp4_files)} files uploaded successfully")
    if failed_files:
        print(f"\n  [FAIL]  Failed files ({len(failed_files)}):")
        for f in failed_files:
            print(f"      - {f}")
    print("=" * 60)

    if success_count > 0:
        print("""
  Next steps:
  1. The Celery worker will now process the videos (transcription,
     structuring, quizzes, HLS encoding, thumbnail generation).
  2. This takes several minutes per video — check progress at:
     http://localhost:3000/teacher/courses/<course-id>/edit
  3. Once AI processing completes, videos will be playable at:
     http://localhost:3000/learn/system-design-software-engineers
""")

if __name__ == "__main__":
    main()
