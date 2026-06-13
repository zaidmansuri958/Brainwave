"""Add mock_test_reviews table and time_taken_seconds to attempts.

Revision ID: 20260611_mock_reviews_and_timing
Revises: 20260611_paper_marking_config
Create Date: 2026-06-11

"""
from alembic import op

revision = "20260611_mock_reviews_and_timing"
down_revision = "20260611_paper_marking_config"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Per-attempt elapsed time (seconds) for time-management analytics
    op.execute(
        "ALTER TABLE mock_test_attempts ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER"
    )

    # Reviews for mock test packages (mirrors course reviews)
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS mock_test_reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID REFERENCES users(id),
            package_id UUID REFERENCES mock_test_packages(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL,
            review_text TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            CONSTRAINT unique_mock_review UNIQUE (student_id, package_id)
        )
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_mock_test_reviews_package_id ON mock_test_reviews (package_id)"
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS mock_test_reviews")
    op.execute("ALTER TABLE mock_test_attempts DROP COLUMN IF EXISTS time_taken_seconds")
