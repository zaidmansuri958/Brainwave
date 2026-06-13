"""Create chat_messages table for persistent AI tutor history.

Revision ID: 20260613_chat_messages
Revises: 20260611_payout_failure_reason
Create Date: 2026-06-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260613_chat_messages"
down_revision = "20260611_payout_failure_reason"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("courses.id"), nullable=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("role", sa.String(length=20), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_chat_messages_course_user", "chat_messages", ["course_id", "user_id"])


def downgrade() -> None:
    op.drop_index("ix_chat_messages_course_user", table_name="chat_messages")
    op.drop_table("chat_messages")
