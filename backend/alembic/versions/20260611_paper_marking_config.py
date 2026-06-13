"""Add marks_per_question and negative_marks to mock_test_papers.

Revision ID: 20260611_paper_marking_config
Revises: e27be46614af
Create Date: 2026-06-11

"""
from alembic import op

revision = "20260611_paper_marking_config"
# Chain onto the migration that CREATES mock_test_papers — otherwise alembic has two heads
# and this column-add can run before the table exists.
down_revision = "e27be46614af"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE mock_test_papers ADD COLUMN IF NOT EXISTS marks_per_question NUMERIC(5,2) NOT NULL DEFAULT 1.0"
    )
    op.execute(
        "ALTER TABLE mock_test_papers ADD COLUMN IF NOT EXISTS negative_marks NUMERIC(5,2) NOT NULL DEFAULT 0.0"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE mock_test_papers DROP COLUMN IF EXISTS marks_per_question")
    op.execute("ALTER TABLE mock_test_papers DROP COLUMN IF EXISTS negative_marks")
