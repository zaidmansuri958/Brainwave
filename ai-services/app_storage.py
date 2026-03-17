import boto3
from botocore.config import Config
import os


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url=os.getenv("MINIO_ENDPOINT_URL", "http://minio:9000"),
        aws_access_key_id=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
        aws_secret_access_key=os.getenv("MINIO_SECRET_KEY", "minioadmin123"),
        config=Config(signature_version="s3v4"),
        region_name="us-east-1"
    )


def upload_thumbnail(image_bytes: bytes, key: str) -> str:
    s3 = get_s3()
    bucket = "thumbnails"
    storage_url = os.getenv("STORAGE_PUBLIC_URL", "http://localhost:9000")

    try:
        s3.put_object(
            Body=image_bytes,
            Bucket=bucket,
            Key=key,
            ContentType="image/png"
        )
        return f"{storage_url}/{bucket}/{key}"
    except Exception as e:
        print(f"Upload failed: {e}")
        return ""
