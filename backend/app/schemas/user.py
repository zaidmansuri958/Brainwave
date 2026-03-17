from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # student, teacher


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuth(BaseModel):
    google_token: str
    role: Optional[str] = "student"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TeacherProfileUpdate(BaseModel):
    bio: Optional[str] = None
    expertise_areas: Optional[List[str]] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None


class TeacherProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    bio: Optional[str] = None
    expertise_areas: Optional[List[str]] = None
    identity_verified: bool
    expert_verified: bool
    outcome_verified: bool
    credibility_score: float
    total_students: int
    avg_completion_rate: float
    pending_payout: float
    total_paid_out: float

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
