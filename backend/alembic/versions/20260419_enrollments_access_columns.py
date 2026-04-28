"""Add Enrollment access columns (align with SQLAlchemy model).

Revision ID: 20260419_enroll_access
Revises: 20260419_payments_plat
Create Date: 2026-04-19

"""
from alembic import op

revision = "20260419_enroll_access"
down_revision = "20260419_payments_plat"
branch_labels = None
depends_on = None


def upgrade() -> None:
    stmts = [
        """ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) NOT NULL DEFAULT 'lifetime'""",
        """ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS access_starts_at TIMESTAMPTZ""",
        """ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ""",
    ]
    for sql in stmts:
        op.execute(sql)


def downgrade() -> None:
    for c in ("access_type", "access_starts_at", "access_expires_at"):
        op.execute(f"ALTER TABLE enrollments DROP COLUMN IF EXISTS {c}")
