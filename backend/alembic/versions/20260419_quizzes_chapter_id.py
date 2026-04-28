"""Add quizzes.chapter_id for chapter-level quizzes (align with SQLAlchemy model).

Revision ID: 20260419_quiz_chapter
Revises: 20260419_enroll_access
Create Date: 2026-04-19

"""
from alembic import op

revision = "20260419_quiz_chapter"
down_revision = "20260419_enroll_access"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        ALTER TABLE quizzes
        ADD COLUMN IF NOT EXISTS chapter_id UUID
        REFERENCES chapters(id) ON DELETE SET NULL
        """
    )


def downgrade() -> None:
    op.execute("ALTER TABLE quizzes DROP COLUMN IF EXISTS chapter_id")
