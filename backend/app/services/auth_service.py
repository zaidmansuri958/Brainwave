from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User, TeacherProfile
from app.schemas.user import UserRegister, UserLogin
from app.utils.jwt import create_access_token, create_refresh_token
from fastapi import HTTPException, status
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def register_user(db: Session, data: UserRegister) -> dict:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if data.role not in ["student", "teacher"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    db.flush()

    if data.role == "teacher":
        profile = TeacherProfile(user_id=user.id, onboarding_status="draft")
        db.add(profile)

    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return {"user": user, "access_token": access_token, "refresh_token": refresh_token}


def login_user(db: Session, data: UserLogin) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return {"user": user, "access_token": access_token, "refresh_token": refresh_token}


def get_user_by_id(db: Session, user_id: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_or_create_google_user(db: Session, google_data: dict, role: str = "student") -> User:
    """Find or create user from Google OAuth data."""
    user = db.query(User).filter(User.google_id == google_data["sub"]).first()
    if not user:
        user = db.query(User).filter(User.email == google_data["email"]).first()

    if user:
        if not user.google_id:
            user.google_id = google_data["sub"]
            db.commit()
        return user

    user = User(
        email=google_data["email"],
        full_name=google_data.get("name", ""),
        avatar_url=google_data.get("picture"),
        google_id=google_data["sub"],
        role=role,
        is_verified=True,
    )
    db.add(user)
    db.flush()

    if role == "teacher":
        profile = TeacherProfile(user_id=user.id, onboarding_status="draft")
        db.add(profile)

    db.commit()
    db.refresh(user)
    return user
