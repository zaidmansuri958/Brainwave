"""
Upload a local video to MinIO and attach it to a course lesson.

Run inside the backend container:
    docker compose exec backend python upload_video.py

The video directory is mounted at /videos inside the container.
"""

import sys
import os
import uuid

# bcrypt compat patch
try:
    import bcrypt as _bcrypt
    if not hasattr(_bcrypt, '__about__'):
        _about = type(sys)('bcrypt.__about__')
        _about.__version__ = _bcrypt.__version__
        _bcrypt.__about__ = _about
except Exception:
    pass

sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.course import Course, Chapter, Lesson
import boto3
from botocore.client import Config

# ─── CONFIG ──────────────────────────────────────────────────────────────────
VIDEO_DIR = "/videos"          # mounted from host
TARGET_COURSE_SLUG = "python-data-science-zero-to-hero"   # change if needed
TARGET_CHAPTER_INDEX = 1       # 1 = first chapter
TARGET_LESSON_INDEX = 1        # 1 = first lesson in that chapter

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
BUCKET = "course-videos"
PUBLIC_URL_BASE = os.getenv("STORAGE_PUBLIC_URL", "http://localhost:9000")
# ─────────────────────────────────────────────────────────────────────────────


def pick_video():
    """Return the path to the first .mp4 file found in VIDEO_DIR."""
    files = [f for f in os.listdir(VIDEO_DIR) if f.lower().endswith(".mp4")]
    if not files:
        print(f"❌  No .mp4 files found in {VIDEO_DIR}")
        sys.exit(1)
    files.sort()
    print("\nAvailable videos:")
    for i, f in enumerate(files):
        size_mb = os.path.getsize(os.path.join(VIDEO_DIR, f)) / 1_048_576
        print(f"  [{i}] {f}  ({size_mb:.1f} MB)")
    choice = input("\nEnter number to upload (default 0): ").strip() or "0"
    return os.path.join(VIDEO_DIR, files[int(choice)])


def upload_to_minio(file_path: str) -> str:
    """Upload file to MinIO and return the public URL."""
    s3 = boto3.client(
        "s3",
        endpoint_url=f"http://{MINIO_ENDPOINT}",
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )

    # Ensure bucket exists
    try:
        s3.create_bucket(Bucket=BUCKET)
    except Exception:
        pass  # already exists

    object_key = f"lessons/{uuid.uuid4()}/{os.path.basename(file_path)}"
    file_size = os.path.getsize(file_path)
    print(f"\n⬆  Uploading {os.path.basename(file_path)} ({file_size/1_048_576:.1f} MB) ...")

    with open(file_path, "rb") as f:
        s3.upload_fileobj(
            f, BUCKET, object_key,
            ExtraArgs={"ContentType": "video/mp4"},
            Callback=lambda bytes_transferred: print(
                f"   {bytes_transferred/1_048_576:.1f}/{file_size/1_048_576:.1f} MB",
                end="\r"
            )
        )

    public_url = f"{PUBLIC_URL_BASE}/{BUCKET}/{object_key}"
    print(f"\n✓  Uploaded → {public_url}")
    return public_url


def attach_to_lesson(video_url: str):
    db = SessionLocal()
    try:
        course = db.query(Course).filter_by(slug=TARGET_COURSE_SLUG).first()
        if not course:
            print(f"❌  Course not found: {TARGET_COURSE_SLUG}")
            sys.exit(1)

        chapters = sorted(course.chapters, key=lambda c: c.order_index)
        if TARGET_CHAPTER_INDEX > len(chapters):
            print(f"❌  Chapter {TARGET_CHAPTER_INDEX} not found (course has {len(chapters)} chapters)")
            sys.exit(1)

        chapter = chapters[TARGET_CHAPTER_INDEX - 1]
        lessons = sorted(chapter.lessons, key=lambda l: l.order_index)
        if TARGET_LESSON_INDEX > len(lessons):
            print(f"❌  Lesson {TARGET_LESSON_INDEX} not found (chapter has {len(lessons)} lessons)")
            sys.exit(1)

        lesson = lessons[TARGET_LESSON_INDEX - 1]
        lesson.video_url = video_url
        lesson.lesson_type = "video"
        lesson.is_published = True
        db.commit()

        print(f"\n✅  Video attached to:")
        print(f"   Course  : {course.title}")
        print(f"   Chapter : {chapter.title}")
        print(f"   Lesson  : {lesson.title}")
        print(f"   URL     : {video_url}")
        print(f"\n   Visit: http://localhost:3000/learn/{TARGET_COURSE_SLUG}")

    finally:
        db.close()


if __name__ == "__main__":
    video_path = pick_video()
    video_url = upload_to_minio(video_path)
    attach_to_lesson(video_url)
