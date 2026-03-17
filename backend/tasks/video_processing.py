import subprocess
import os
import shutil
import tempfile
import redis
from tasks.celery_app import celery_app

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)

QUALITY_PROFILES = [
    {"name": "480p", "resolution": "854:480", "bitrate": "800k", "bandwidth": 800000},
    {"name": "720p", "resolution": "1280:720", "bitrate": "2500k", "bandwidth": 2500000},
    {"name": "1080p", "resolution": "1920:1080", "bitrate": "5000k", "bandwidth": 5000000},
]


@celery_app.task
def process_video_hls(lesson_id: str, raw_video_url: str, course_id: str):
    """Transcode uploaded video into HLS adaptive streaming format."""
    from app.services.storage_service import upload_file_path, get_s3_client
    from app.database import SessionLocal
    from app.models.course import Lesson

    output_dir = f"/tmp/hls_{lesson_id}"
    os.makedirs(output_dir, exist_ok=True)

    db = SessionLocal()
    try:
        redis_client.hset(f"ai_status:{course_id}", "video_status", "processing")

        # Download the video first
        import boto3
        from botocore.config import Config

        s3 = boto3.client(
            "s3",
            endpoint_url=os.getenv("MINIO_ENDPOINT_URL", "http://minio:9000"),
            aws_access_key_id=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
            aws_secret_access_key=os.getenv("MINIO_SECRET_KEY", "minioadmin123"),
            config=Config(signature_version="s3v4"),
            region_name="us-east-1"
        )

        # Parse URL to get bucket/key
        raw_path = f"/tmp/raw_{lesson_id}.mp4"

        variant_playlists = []
        for profile in QUALITY_PROFILES:
            output_path = f"{output_dir}/{profile['name']}"
            os.makedirs(output_path, exist_ok=True)

            result = subprocess.run([
                "ffmpeg", "-i", raw_path,
                "-vf", f"scale={profile['resolution']}",
                "-c:v", "libx264",
                "-b:v", profile["bitrate"],
                "-c:a", "aac",
                "-b:a", "128k",
                "-hls_time", "10",
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", f"{output_path}/segment_%03d.ts",
                f"{output_path}/playlist.m3u8"
            ], capture_output=True, text=True)

            if result.returncode == 0:
                variant_playlists.append(profile)
                redis_client.hset(f"ai_status:{course_id}", "video_progress", str(
                    int((QUALITY_PROFILES.index(profile) + 1) / len(QUALITY_PROFILES) * 80)
                ))

        # Create master playlist
        master_content = "#EXTM3U\n#EXT-X-VERSION:3\n\n"
        for profile in variant_playlists:
            res = profile["resolution"].replace(":", "x")
            master_content += f"#EXT-X-STREAM-INF:BANDWIDTH={profile['bandwidth']},RESOLUTION={res}\n"
            master_content += f"{profile['name']}/playlist.m3u8\n\n"

        master_path = f"{output_dir}/master.m3u8"
        with open(master_path, "w") as f:
            f.write(master_content)

        # Upload to MinIO
        bucket = "course-videos"
        base_key = f"lessons/{lesson_id}/hls"
        storage_url = os.getenv("STORAGE_PUBLIC_URL", "http://localhost:9000")

        upload_file_path(master_path, bucket, f"{base_key}/master.m3u8", "application/x-mpegURL")

        for profile in QUALITY_PROFILES:
            quality_dir = f"{output_dir}/{profile['name']}"
            if os.path.exists(quality_dir):
                for file in os.listdir(quality_dir):
                    file_path = f"{quality_dir}/{file}"
                    ct = "application/x-mpegURL" if file.endswith(".m3u8") else "video/MP2T"
                    upload_file_path(file_path, bucket, f"{base_key}/{profile['name']}/{file}", ct)

        master_url = f"{storage_url}/{bucket}/{base_key}/master.m3u8"

        # Save to DB
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if lesson:
            lesson.video_url = master_url
            db.commit()

        redis_client.hset(f"ai_status:{course_id}", "video_status", "completed")
        redis_client.hset(f"ai_status:{course_id}", "video_progress", "100")
        redis_client.hset(f"ai_status:{course_id}", "qualities_ready", "480p,720p,1080p")

    except Exception as e:
        redis_client.hset(f"ai_status:{course_id}", "video_status", "failed")
        redis_client.hset(f"ai_status:{course_id}", "error", str(e))
        print(f"HLS processing failed: {e}")
    finally:
        shutil.rmtree(output_dir, ignore_errors=True)
        if os.path.exists(raw_path):
            os.remove(raw_path)
        db.close()
