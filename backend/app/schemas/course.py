from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Decimal = Decimal("0")
    category: Optional[str] = None
    difficulty_level: Optional[str] = None
    language: str = "English"
    tags: Optional[List[str]] = None
    completion_requirement_percent: int = 80
    quiz_pass_percent: int = 60
    certificate_enabled: bool = True


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    difficulty_level: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    completion_requirement_percent: Optional[int] = None
    quiz_pass_percent: Optional[int] = None
    certificate_enabled: Optional[bool] = None


class TeacherInfo(BaseModel):
    id: UUID
    full_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: UUID
    title: str
    lesson_type: Optional[str] = None
    order_index: int
    duration_seconds: Optional[int] = None
    is_published: bool
    ai_summary: Optional[str] = None

    class Config:
        from_attributes = True


class ChapterResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    order_index: int
    is_free_preview: bool
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True


class CourseResponse(BaseModel):
    id: UUID
    teacher_id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: Decimal
    currency: str
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = None
    language: str
    status: str
    total_chapters: int
    total_duration_minutes: int
    enrolled_count: int
    avg_rating: float
    review_count: int
    certificate_enabled: bool
    ai_processing_status: str
    is_featured: bool
    created_at: datetime
    teacher: Optional[TeacherInfo] = None
    chapters: Optional[List[ChapterResponse]] = None

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    courses: List[CourseResponse]
    total: int
    page: int
    pages: int


class AIStatusResponse(BaseModel):
    video_processing: dict
    ai_processing: dict
    error: Optional[str] = None


class CourseStructureApproval(BaseModel):
    approved: bool
    modifications: Optional[dict] = None


class MaterialUploadResponse(BaseModel):
    upload_ids: List[str]
    task_id: str
    message: str
