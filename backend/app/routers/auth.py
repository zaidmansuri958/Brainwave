from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.config import settings
from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, GoogleAuth, TokenRefresh, AuthResponse, UserResponse, UserUpdate
from app.services.auth_service import register_user, login_user, get_or_create_google_user
from fastapi.security import HTTPAuthorizationCredentials
from app.utils.jwt import verify_token, create_access_token, blacklist_token, get_current_user_payload, security
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
import httpx

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse)
async def register(data: UserRegister, db: Session = Depends(get_db)):
    result = register_user(db, data)
    return AuthResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=UserResponse.from_orm(result["user"])
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    result = login_user(db, data)
    return AuthResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=UserResponse.from_orm(result["user"])
    )


@router.post("/google")
async def google_auth(data: GoogleAuth, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth token."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {data.google_token}"}
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        google_data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=401, detail="Failed to verify Google token")

    user = get_or_create_google_user(db, google_data, data.role or "student")

    from app.utils.jwt import create_access_token, create_refresh_token
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }


@router.post("/refresh")
async def refresh_token(data: TokenRefresh):
    payload = verify_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token({"sub": payload["sub"], "role": payload.get("role")})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Revoke the presented access token so it can't be reused after logout.
    blacklist_token(credentials.credentials)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the current user's own profile (name, avatar). Works for any role."""
    payload = data.dict(exclude_unset=True)
    if "full_name" in payload and payload["full_name"] is not None:
        full_name = payload["full_name"].strip()
        if not full_name:
            raise HTTPException(status_code=400, detail="Full name cannot be empty")
        current_user.full_name = full_name
    if "avatar_url" in payload and payload["avatar_url"] is not None:
        current_user.avatar_url = payload["avatar_url"]
    db.commit()
    db.refresh(current_user)
    return UserResponse.from_orm(current_user)


@router.post("/forgot-password")
async def forgot_password(data: dict, db: Session = Depends(get_db)):
    """Generate a time-limited reset token and email a reset link.
    Always returns 200 to prevent email enumeration."""
    email = (data.get("email") or "").strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user and user.password_hash:
        from datetime import datetime, timedelta
        from jose import jwt as jose_jwt
        expire = datetime.utcnow() + timedelta(minutes=30)
        token = jose_jwt.encode(
            {"sub": str(user.id), "type": "password_reset", "exp": expire},
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        reset_link = f"{settings.frontend_url}/reset-password?token={token}"
        try:
            from app.utils.email import send_email
            send_email(
                to=user.email,
                subject=f"Reset your {settings.platform_name} password",
                html=f"""
                <h2>Reset your password</h2>
                <p>Hi {user.full_name or 'there'},</p>
                <p>We received a request to reset your password. This link is valid for 30 minutes:</p>
                <p><a href="{reset_link}">Reset my password</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                """,
            )
        except Exception:
            pass
    return {"message": "If that email is registered, a reset link has been sent."}


class ResetPassword(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    """Complete a password reset using the emailed token."""
    if len((data.new_password or "")) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    try:
        # verify_token decodes, checks expiry, and rejects already-used (blacklisted) tokens.
        payload = verify_token(data.token)
    except HTTPException:
        raise HTTPException(status_code=400, detail="Reset link is invalid, expired, or already used")
    if payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid reset token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    from app.services.auth_service import hash_password
    user.password_hash = hash_password(data.new_password)
    db.commit()
    blacklist_token(data.token)  # single-use
    return {"message": "Password reset successful. You can now log in."}
