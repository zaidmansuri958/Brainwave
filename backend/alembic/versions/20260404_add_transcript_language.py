"""Add transcript_language to courses and lessons (Whisper ISO codes).

Revision ID: 20260404_transcript_lang
Revises:
Create Date: 2026-04-04

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "20260404_transcript_lang"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS keeps this safe on partially migrated or replayed DBs.
    op.execute(
        "ALTER TABLE courses ADD COLUMN IF NOT EXISTS transcript_language VARCHAR(16)"
    )
    op.execute(
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS transcript_language VARCHAR(16)"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE courses DROP COLUMN IF EXISTS transcript_language")
    op.execute("ALTER TABLE lessons DROP COLUMN IF EXISTS transcript_language")
