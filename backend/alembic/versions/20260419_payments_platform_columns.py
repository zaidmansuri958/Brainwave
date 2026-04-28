"""Add Payment columns for platform cut % and teacher earning (align with SQLAlchemy model).

Revision ID: 20260419_payments_plat
Revises: 20260419_lessons_ext
Create Date: 2026-04-19

"""
from alembic import op

revision = "20260419_payments_plat"
down_revision = "20260419_lessons_ext"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_cut_percent_applied NUMERIC(5, 2)"""
    )
    op.execute(
        """ALTER TABLE payments ADD COLUMN IF NOT EXISTS teacher_earning NUMERIC(10, 2)"""
    )


def downgrade() -> None:
    op.execute("ALTER TABLE payments DROP COLUMN IF EXISTS platform_cut_percent_applied")
    op.execute("ALTER TABLE payments DROP COLUMN IF EXISTS teacher_earning")
