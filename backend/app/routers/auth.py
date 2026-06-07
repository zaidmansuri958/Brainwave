from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, GoogleAuth, TokenRefresh, AuthResponse, UserResponse
from app.services.auth_service import register_user, login_user, get_or_create_google_user
from app.utils.jwt import verify_token, create_access_token, blacklist_token, get_current_user_payload
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
    payload: dict = Depends(get_current_user_payload)
):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)


@router.post("/forgot-password")
async def forgot_password(data: dict, db: Session = Depends(get_db)):
    """
    Password reset stub. Always returns 200 to prevent email enumeration.
    Email delivery requires SMTP configuration — wire up a mail service here.
    """
    email = data.get("email", "").strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user:
        # TODO: generate a time-limited reset token, store it, and email the reset link
        pass
    return {"message": "If that email is registered, a reset link has been sent."}
