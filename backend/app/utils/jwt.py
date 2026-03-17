from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
import redis

security = HTTPBearer()
redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    token = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    # Store refresh token in Redis
    redis_client.setex(
        f"refresh:{data.get('sub')}",
        settings.refresh_token_expire_days * 86400,
        token
    )
    return token


def verify_token(token: str) -> dict:
    try:
        # Check blacklist
        if redis_client.get(f"blacklist:{token}"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def blacklist_token(token: str):
    redis_client.setex(f"blacklist:{token}", settings.access_token_expire_minutes * 60, "1")


async def get_current_user_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    return verify_token(credentials.credentials)
