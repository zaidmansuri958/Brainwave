import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    attachments = Column(JSONB, nullable=True)
    post_type = Column(String(20), default="discussion")  # discussion, doubt, announcement
    is_pinned = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    course = relationship("Course", back_populates="community_posts")
    author = relationship("User", back_populates="community_posts")
    replies = relationship("CommunityReply", back_populates="post", cascade="all, delete-orphan")


class CommunityReply(Base):
    __tablename__ = "community_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"))
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    is_official_answer = Column(Boolean, default=False)
    is_ai_response = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    post = relationship("CommunityPost", back_populates="replies")
    author = relationship("User")
