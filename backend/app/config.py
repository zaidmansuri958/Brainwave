from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:password@localhost:5432/brainwave"
    auto_create_tables: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # JWT
    jwt_secret: str = "your-secret-key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    refresh_token_expire_days: int = 30
    
    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_endpoint_url: str = "http://localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin123"
    minio_secure: bool = False
    storage_public_url: str = "http://localhost:9000"
    
    # AI Services
    ai_service_url: str = "http://ai-services:8001"
    
    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""
    platform_cut_percent: int = 20
    # RazorpayX (teacher payouts). Leave account number blank to run in simulated mode.
    razorpayx_account_number: str = ""
    razorpayx_mode: str = "auto"  # auto | simulated | live
    payout_min_amount: float = 100.0
    
    # Email
    resend_api_key: str = ""
    platform_email: str = "noreply@brainwave.ai"
    platform_name: str = "Brainwave.ai"
    
    # URLs
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    environment: str = "development"
    
    # Jitsi
    jitsi_domain: str = "meet.jit.si"
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # Google OAuth
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
