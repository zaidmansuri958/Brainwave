"""Add failure_reason to payouts for RazorpayX disbursement.

Revision ID: 20260611_payout_failure_reason
Revises: 20260611_mock_reviews_and_timing
Create Date: 2026-06-11

"""
from alembic import op

revision = "20260611_payout_failure_reason"
down_revision = "20260611_mock_reviews_and_timing"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE payouts ADD COLUMN IF NOT EXISTS failure_reason TEXT")


def downgrade() -> None:
    op.execute("ALTER TABLE payouts DROP COLUMN IF EXISTS failure_reason")
