import uuid
from sqlalchemy import Column, String, DateTime, Numeric, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class DoubtSession(Base):
    __tablename__ = "doubt_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    session_type = Column(String(10), nullable=True)  # one_on_one, group
    max_students = Column(Integer, default=1)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    topic = Column(String(255), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    jitsi_room_name = Column(String(255), nullable=True)
    jitsi_room_password = Column(String(100), nullable=True)
    status = Column(String(20), default="available")  # available, booked, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teacher = relationship("User")
    course = relationship("Course", back_populates="doubt_sessions")
    bookings = relationship("DoubtSessionBooking", back_populates="doubt_session")


class DoubtSessionBooking(Base):
    __tablename__ = "doubt_session_bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doubt_session_id = Column(UUID(as_uuid=True), ForeignKey("doubt_sessions.id"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    payment_id = Column(UUID(as_uuid=True), nullable=True)
    amount_paid = Column(Numeric(10, 2), nullable=True)
    booked_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("doubt_session_id", "student_id", name="unique_booking"),)

    # Relationships
    doubt_session = relationship("DoubtSession", back_populates="bookings")
    student = relationship("User")
