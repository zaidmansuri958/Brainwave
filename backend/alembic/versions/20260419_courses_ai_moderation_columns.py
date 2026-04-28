"""Add Course columns for AI pipeline, moderation, and access (align with SQLAlchemy model).

Revision ID: 20260419_courses_ai_mod
Revises: 20260404_teacher_profiles
Create Date: 2026-04-19

"""
from alembic import op

revision = "20260419_courses_ai_mod"
down_revision = "20260404_teacher_profiles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    stmts = [
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(30) NOT NULL DEFAULT 'pending'""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS ai_last_error TEXT""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS ai_pipeline_step VARCHAR(50)""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(30) NOT NULL DEFAULT 'video_course'""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(30) NOT NULL DEFAULT 'pending'""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_validation_status VARCHAR(30) NOT NULL DEFAULT 'pending'""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_validation_details JSONB""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS default_access_months INTEGER""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS module_lock_enabled BOOLEAN NOT NULL DEFAULT TRUE""",
        """ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE""",
    ]
    for sql in stmts:
        op.execute(sql)


def downgrade() -> None:
    cols = [
        "ai_processing_status",
        "ai_last_error",
        "ai_pipeline_step",
        "delivery_mode",
        "moderation_status",
        "content_validation_status",
        "content_validation_details",
        "default_access_months",
        "module_lock_enabled",
        "is_featured",
    ]
    for c in cols:
        op.execute(f"ALTER TABLE courses DROP COLUMN IF EXISTS {c}")
