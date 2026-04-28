"""Add Lesson columns for thumbnails, transcripts, AI summary (align with SQLAlchemy model).

Revision ID: 20260419_lessons_ext
Revises: 20260419_courses_ai_mod
Create Date: 2026-04-19

"""
from alembic import op

revision = "20260419_lessons_ext"
down_revision = "20260419_courses_ai_mod"
branch_labels = None
depends_on = None


def upgrade() -> None:
    stmts = [
        """ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500)""",
        """ALTER TABLE lessons ADD COLUMN IF NOT EXISTS raw_transcript TEXT""",
        """ALTER TABLE lessons ADD COLUMN IF NOT EXISTS ai_summary TEXT""",
        """ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE""",
    ]
    for sql in stmts:
        op.execute(sql)


def downgrade() -> None:
    for c in ("thumbnail_url", "raw_transcript", "ai_summary", "is_published"):
        op.execute(f"ALTER TABLE lessons DROP COLUMN IF EXISTS {c}")
