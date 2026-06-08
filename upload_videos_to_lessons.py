"""
Brainwave -- Smart Video Uploader for System Design Course
===========================================================
1. Scans D:\\beginner for MP4 files
2. Checks duration (pure Python MP4 parser) -- skips any > 30 minutes
3. Rebuilds the System Design course curriculum from scratch
4. Uploads eligible videos directly to MinIO via boto3
5. Updates lesson.video_url + duration_seconds in PostgreSQL
"""

import os
import sys
import glob
import struct
import subprocess
import json
import time

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Auto-install missing deps
def ensure(*pkgs):
    for pkg in pkgs:
        try:
            __import__(pkg)
        except ImportError:
            print(f"[INSTALL] Installing {pkg}...")
            subprocess.run([sys.executable, "-m", "pip", "install", pkg, "-q"], check=True)

ensure("requests", "boto3")

import requests  # noqa: E402
import boto3     # noqa: E402
from botocore.config import Config  # noqa: E402

# ── Config ────────────────────────────────────────────────────────────────────
API_BASE         = "http://localhost:8000/api/v1"
VIDEO_DIR        = r"D:\beginner"
COURSE_SLUG      = "system-design-software-engineers"
TEACHER_EMAIL    = "arjun.mehta@brainwave.ai"
TEACHER_PASSWORD = "Teacher@123"

MINIO_ENDPOINT   = "http://localhost:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin123"
MINIO_BUCKET     = "course-videos"

MAX_DURATION_SEC = 30 * 60   # 30 minutes
DOCKER_POSTGRES  = "brainwave-postgres-1"

# ── Curriculum chapters (maps video number -> chapter) ────────────────────────
CHAPTERS = [
    {"title": "Introduction & Fundamentals",   "video_nums": [1, 2, 3, 4]},
    {"title": "Databases",                     "video_nums": [5, 6, 7, 8, 9, 10]},
    {"title": "Caching",                       "video_nums": [11, 12, 13]},
    {"title": "Messaging & Real-time",         "video_nums": [14, 15, 16]},
    {"title": "Infrastructure & Scalability",  "video_nums": [17, 18, 19, 20, 21, 22, 23, 24, 25]},
    {"title": "System Design Case Studies",    "video_nums": [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]},
]


# ── Pure-Python MP4 duration extractor ───────────────────────────────────────
def get_mp4_duration_seconds(filepath: str):
    """Extract duration from MP4 mvhd atom without any external tools."""
    try:
        size = os.path.getsize(filepath)
        with open(filepath, "rb") as f:
            # Read first 2 MB from start
            data = bytearray(f.read(2 * 1024 * 1024))
            # If mvhd not found in first 2 MB, also read last 2 MB
            if b"mvhd" not in data and size > 2 * 1024 * 1024:
                f.seek(max(0, size - 2 * 1024 * 1024))
                data.extend(f.read(2 * 1024 * 1024))

        pos = data.find(b"mvhd")
        if pos == -1:
            return None

        mvhd = data[pos + 4:]   # skip 'mvhd' marker
        version = struct.unpack("B", mvhd[0:1])[0]

        if version == 1:
            timescale = struct.unpack(">I", mvhd[20:24])[0]
            duration  = struct.unpack(">Q", mvhd[24:32])[0]
        else:
            timescale = struct.unpack(">I", mvhd[12:16])[0]
            duration  = struct.unpack(">I", mvhd[16:20])[0]

        return (duration / timescale) if timescale else None
    except Exception:
        return None


def fmt_dur(secs):
    if secs is None:
        return "??:??"
    m, s = divmod(int(secs), 60)
    h, m = divmod(m, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


# ── Auth ──────────────────────────────────────────────────────────────────────
def login():
    print(f"[AUTH]  Logging in as {TEACHER_EMAIL}...")
    r = requests.post(f"{API_BASE}/auth/login",
                      json={"email": TEACHER_EMAIL, "password": TEACHER_PASSWORD})
    if r.status_code != 200:
        print(f"[FAIL]  Login failed: {r.status_code} -- {r.text[:200]}")
        sys.exit(1)
    token = r.json()["access_token"]
    print("[OK]    Logged in.")
    return token


# ── Course lookup ─────────────────────────────────────────────────────────────
def get_course(token):
    print(f"[FIND]  Looking up course '{COURSE_SLUG}'...")
    r = requests.get(f"{API_BASE}/courses/{COURSE_SLUG}",
                     headers={"Authorization": f"Bearer {token}"})
    if r.status_code != 200:
        print(f"[FAIL]  Course not found: {r.text[:200]}")
        sys.exit(1)
    data = r.json()
    print(f"[OK]    Course ID: {data['id']}")
    return data["id"]


# ── Delete existing chapters ──────────────────────────────────────────────────
def clear_curriculum(token, course_id):
    print("[CLEAR] Fetching existing chapters...")
    r = requests.get(
        f"{API_BASE}/teacher/curriculum/courses/{course_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    if r.status_code != 200:
        print(f"[WARN]  Could not fetch curriculum: {r.text[:200]}")
        return
    body = r.json()
    # API returns {"course_id": ..., "chapters": [...]} or a plain list
    chapters = body.get("chapters", body) if isinstance(body, dict) else body
    for ch in chapters:
        cid = ch["id"]
        dr = requests.delete(
            f"{API_BASE}/teacher/curriculum/courses/{course_id}/chapters/{cid}",
            headers={"Authorization": f"Bearer {token}"},
        )
        status = "OK" if dr.status_code == 200 else f"FAIL({dr.status_code})"
        print(f"   [DEL] chapter '{ch['title']}' -> {status}")
    print(f"[OK]    Cleared {len(chapters)} existing chapters.")


# ── Create chapter ────────────────────────────────────────────────────────────
def create_chapter(token, course_id, title, order_index):
    r = requests.post(
        f"{API_BASE}/teacher/curriculum/courses/{course_id}/chapters",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": title, "order_index": order_index},
    )
    if r.status_code != 200:
        print(f"[FAIL]  Create chapter '{title}': {r.text[:200]}")
        return None
    return r.json()["id"]


# ── Create lesson ─────────────────────────────────────────────────────────────
def create_lesson(token, course_id, chapter_id, title, order_index):
    r = requests.post(
        f"{API_BASE}/teacher/curriculum/courses/{course_id}/lessons",
        headers={"Authorization": f"Bearer {token}"},
        json={"chapter_id": chapter_id, "title": title, "order_index": order_index},
    )
    if r.status_code != 200:
        print(f"[FAIL]  Create lesson '{title}': {r.text[:200]}")
        return None
    return r.json()["id"]


# ── Upload to MinIO ───────────────────────────────────────────────────────────
def get_s3():
    return boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def upload_to_minio(s3, lesson_id, filepath):
    filename = os.path.basename(filepath)
    key = f"lessons/{lesson_id}/{filename}"
    size_mb = os.path.getsize(filepath) / 1024 / 1024
    print(f"   [UP]  uploading {size_mb:.1f} MB to MinIO...", end="", flush=True)
    try:
        s3.upload_file(filepath, MINIO_BUCKET, key, ExtraArgs={"ContentType": "video/mp4"})
        url = f"{MINIO_ENDPOINT}/{MINIO_BUCKET}/{key}"
        print(" [OK]")
        return url
    except Exception as e:
        print(f" [FAIL] {e}")
        return None


# ── Update lesson in DB ───────────────────────────────────────────────────────
def update_lesson_db(lesson_id, video_url, duration_sec):
    dur_int = int(duration_sec) if duration_sec else 0
    sql = (
        f"UPDATE lessons SET video_url='{video_url}', "
        f"duration_seconds={dur_int}, lesson_type='video', "
        f"is_published=true WHERE id='{lesson_id}';"
    )
    result = subprocess.run(
        ["docker", "exec", DOCKER_POSTGRES, "psql", "-U", "postgres", "-d", "brainwave", "-c", sql],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"   [FAIL] DB update: {result.stderr[:200]}")
        return False
    return True


# ── Clean title from filename ─────────────────────────────────────────────────
def clean_title(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    # Remove leading "NN. " or "NN - "
    import re
    name = re.sub(r"^\d+[\.\-\s]+", "", name).strip()
    # Replace underscores with spaces
    name = name.replace("_", " ").replace("  ", " ")
    return name


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  Brainwave -- System Design Course Video Uploader")
    print("=" * 65)

    # 1. Scan MP4 files
    mp4_files = sorted(glob.glob(os.path.join(VIDEO_DIR, "*.mp4")))
    if not mp4_files:
        print(f"[FAIL]  No MP4 files found in {VIDEO_DIR}")
        sys.exit(1)
    print(f"\n[SCAN]  Found {len(mp4_files)} MP4 files in {VIDEO_DIR}")

    # 2. Get durations and filter
    print("\n[DUR]   Checking video durations...")
    video_info = {}   # num -> {path, title, duration, skip}
    for path in mp4_files:
        fname = os.path.basename(path)
        # Extract number from filename (e.g. "16. Realtime Pubsub.mp4" -> 16)
        import re
        m = re.match(r"^(\d+)", fname)
        num = int(m.group(1)) if m else 0
        dur = get_mp4_duration_seconds(path)
        skip = dur is not None and dur > MAX_DURATION_SEC
        title = clean_title(fname)
        video_info[num] = {
            "path": path, "filename": fname,
            "title": title, "duration": dur, "skip": skip,
        }
        flag = " [SKIP >30 min]" if skip else ""
        size_mb = os.path.getsize(path) / 1024 / 1024
        print(f"   {num:02d}. {title[:42]:<42} {fmt_dur(dur):>7}  {size_mb:>6.1f} MB{flag}")

    eligible = {n: v for n, v in video_info.items() if not v["skip"]}
    skipped  = {n: v for n, v in video_info.items() if v["skip"]}
    print(f"\n[FILTER] {len(eligible)} eligible (<=30 min), {len(skipped)} skipped (>30 min)")
    if skipped:
        print("   Skipped:")
        for n, v in sorted(skipped.items()):
            print(f"   - {v['filename']} ({fmt_dur(v['duration'])})")

    # 3. Auth + course
    token     = login()
    course_id = get_course(token)

    # 4. Rebuild curriculum
    print("\n[BUILD] Rebuilding curriculum...")
    clear_curriculum(token, course_id)

    # 5. Init S3 client
    s3 = get_s3()

    # 6. Create chapters + lessons + upload
    total_ok   = 0
    total_fail = 0

    for ci, chapter_def in enumerate(CHAPTERS):
        ch_title  = chapter_def["title"]
        ch_nums   = chapter_def["video_nums"]
        ch_id     = create_chapter(token, course_id, ch_title, ci + 1)
        if not ch_id:
            continue
        print(f"\n[CH {ci+1}] {ch_title}")

        lesson_order = 1
        for vnum in ch_nums:
            if vnum not in video_info:
                continue
            info = video_info[vnum]
            lesson_title = info["title"]

            # Create lesson (even for skipped ones -- just no video)
            lesson_id = create_lesson(token, course_id, ch_id, lesson_title, lesson_order)
            lesson_order += 1
            if not lesson_id:
                total_fail += 1
                continue

            if info["skip"]:
                print(f"   [--]  [{vnum:02d}] {lesson_title[:50]} -- SKIPPED (>{MAX_DURATION_SEC//60} min)")
                continue

            # Upload video
            print(f"   [{vnum:02d}] {lesson_title[:50]}", end=" ")
            video_url = upload_to_minio(s3, lesson_id, info["path"])
            if not video_url:
                total_fail += 1
                continue

            # Update DB
            ok = update_lesson_db(lesson_id, video_url, info["duration"])
            if ok:
                total_ok += 1
            else:
                total_fail += 1

    print("\n" + "=" * 65)
    print(f"  DONE: {total_ok} videos uploaded, {len(skipped)} skipped (>30 min), {total_fail} failed")
    print("=" * 65)
    if total_ok > 0:
        print("\n  Videos are now directly playable at:")
        print("  http://localhost:3000/learn/system-design-software-engineers")


if __name__ == "__main__":
    main()
