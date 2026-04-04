import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, ForeignKey, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class StudyMaterialProduct(Base):
    __tablename__ = "study_material_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    currency = Column(String(10), default="INR")
    status = Column(String(20), default="draft")  # draft, published, archived
    moderation_status = Column(String(30), default="pending")
    content_validation_details = Column(JSONB, nullable=True)
    enrolled_count = Column(BigInteger, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher = relationship("User", foreign_keys=[teacher_id])
    files = relationship("StudyMaterialFile", back_populates="product", cascade="all, delete-orphan")


class StudyMaterialFile(Base):
    __tablename__ = "study_material_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("study_material_products.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=True)
    file_type = Column(String(50), nullable=True)
    processing_status = Column(String(30), default="pending")
    extracted_text_preview = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("StudyMaterialProduct", back_populates="files")


class StudyMaterialPurchase(Base):
    __tablename__ = "study_material_purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("study_material_products.id"))
    payment_id = Column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=True)
    amount_paid = Column(Numeric(10, 2), nullable=True)
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", foreign_keys=[student_id])
    product = relationship("StudyMaterialProduct")
