"""Add teacher_profiles onboarding / KYC / payout columns (align with SQLAlchemy model).

Revision ID: 20260404_teacher_profiles
Revises: 20260404_transcript_lang
Create Date: 2026-04-04

"""
from alembic import op

revision = "20260404_teacher_profiles"
down_revision = "20260404_transcript_lang"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # One statement per column — IF NOT EXISTS is safe on existing DBs.
    stmts = [
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(20) NOT NULL DEFAULT 'approved'""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS years_teaching INTEGER""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS past_employers JSONB""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS highest_degree VARCHAR(255)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS degree_proof_url VARCHAR(500)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS aadhaar_doc_url VARCHAR(500)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS pan_doc_url VARCHAR(500)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS onboarding_submitted_at TIMESTAMPTZ""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS onboarding_reviewed_at TIMESTAMPTZ""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS expert_verified BOOLEAN DEFAULT FALSE""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS outcome_verified BOOLEAN DEFAULT FALSE""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS credibility_score NUMERIC(3, 2) DEFAULT 0""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS avg_completion_rate NUMERIC(5, 2) DEFAULT 0""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS payout_bank_details JSONB""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(20)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_verified BOOLEAN DEFAULT FALSE""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS razorpay_contact_id VARCHAR(100)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS razorpay_fund_account_id VARCHAR(100)""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS pending_payout NUMERIC(10, 2) DEFAULT 0""",
        """ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS total_paid_out NUMERIC(10, 2) DEFAULT 0""",
    ]
    for sql in stmts:
        op.execute(sql)


def downgrade() -> None:
    cols = [
        "onboarding_status",
        "legal_name",
        "years_teaching",
        "past_employers",
        "highest_degree",
        "degree_proof_url",
        "aadhaar_doc_url",
        "pan_doc_url",
        "onboarding_submitted_at",
        "onboarding_reviewed_at",
        "rejection_reason",
        "identity_verified",
        "expert_verified",
        "outcome_verified",
        "verification_documents",
        "credibility_score",
        "total_students",
        "avg_completion_rate",
        "payout_bank_details",
        "bank_account_name",
        "bank_account_number",
        "bank_ifsc",
        "bank_verified",
        "razorpay_contact_id",
        "razorpay_fund_account_id",
        "pending_payout",
        "total_paid_out",
    ]
    for c in cols:
        op.execute(f"ALTER TABLE teacher_profiles DROP COLUMN IF EXISTS {c}")
