import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.config import settings
import uuid
import os


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.minio_endpoint_url,
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1"
    )


BUCKETS = {
    "videos": "course-videos",
    "materials": "course-materials",
    "thumbnails": "thumbnails",
    "certificates": "certificates",
    "avatars": "avatars",
}


def ensure_bucket(bucket_name: str):
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError:
        s3.create_bucket(Bucket=bucket_name)


def upload_file(file_data: bytes, bucket: str, key: str, content_type: str = "application/octet-stream") -> str:
    s3 = get_s3_client()
    try:
        ensure_bucket(bucket)
        s3.put_object(Body=file_data, Bucket=bucket, Key=key, ContentType=content_type)
        return f"{settings.storage_public_url}/{bucket}/{key}"
    except Exception as e:
        raise Exception(f"Upload failed: {e}")


def upload_file_path(file_path: str, bucket: str, key: str, content_type: str = "application/octet-stream") -> str:
    s3 = get_s3_client()
    try:
        ensure_bucket(bucket)
        s3.upload_file(file_path, bucket, key, ExtraArgs={"ContentType": content_type})
        return f"{settings.storage_public_url}/{bucket}/{key}"
    except Exception as e:
        raise Exception(f"Upload failed: {e}")


def get_presigned_url(bucket: str, key: str, expiry: int = 3600) -> str:
    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expiry
        )
        return url
    except Exception as e:
        return f"{settings.storage_public_url}/{bucket}/{key}"


def delete_file(bucket: str, key: str):
    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=bucket, Key=key)
    except Exception as e:
        print(f"Delete failed: {e}")
