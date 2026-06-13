"""RazorpayX teacher payout disbursement.

Runs in one of three modes (resolved from settings.razorpayx_mode):
  - "live"      → real RazorpayX API calls (money moves in live keys, simulated in test keys)
  - "simulated" → no API calls; payouts are marked completed locally (for demo/dev)
  - "auto"      → live if RAZORPAYX_ACCOUNT_NUMBER + keys are present, else simulated

The same Razorpay key_id / key_secret used for the Payment Gateway authenticate
the Payouts API (HTTP Basic Auth). The only extra config needed for live mode is
the RazorpayX source account number (RAZORPAYX_ACCOUNT_NUMBER).
"""
import re
import uuid
from datetime import datetime, timezone

import requests

from app.config import settings

RAZORPAY_API = "https://api.razorpay.com/v1"

# RazorpayX payout lifecycle statuses
_SUCCESS_TERMINAL = {"processed"}
_FAIL_TERMINAL = {"failed", "reversed", "cancelled", "rejected"}


def _auth():
    return (settings.razorpay_key_id, settings.razorpay_key_secret)


def payouts_mode() -> str:
    """Resolve the effective payout mode."""
    mode = (settings.razorpayx_mode or "auto").lower()
    if mode in ("live", "simulated"):
        return mode
    # auto
    if settings.razorpayx_account_number and settings.razorpay_key_id and settings.razorpay_key_secret:
        return "live"
    return "simulated"


def _ensure_fund_account_live(profile, teacher) -> str:
    """Create a Razorpay contact + fund account for the teacher if missing.
    Returns the fund_account_id. Persists ids onto the profile (caller commits).

    Any simulated ids left over from simulated-mode runs ("..._sim_...") are
    discarded so live disbursement always uses real RazorpayX entities."""
    if profile.razorpay_contact_id and "_sim_" in profile.razorpay_contact_id:
        profile.razorpay_contact_id = None
    if profile.razorpay_fund_account_id and "_sim_" in profile.razorpay_fund_account_id:
        profile.razorpay_fund_account_id = None

    contact_id = profile.razorpay_contact_id
    if not contact_id:
        resp = requests.post(
            f"{RAZORPAY_API}/contacts",
            auth=_auth(),
            json={
                "name": (profile.bank_account_name or teacher.full_name or "Teacher")[:50],
                "email": teacher.email,
                "type": "vendor",
                "reference_id": f"tch_{teacher.id.hex}",  # ≤40 chars (RazorpayX limit)
            },
            timeout=20,
        )
        resp.raise_for_status()
        contact_id = resp.json()["id"]
        profile.razorpay_contact_id = contact_id

    if profile.razorpay_fund_account_id:
        return profile.razorpay_fund_account_id

    resp = requests.post(
        f"{RAZORPAY_API}/fund_accounts",
        auth=_auth(),
        json={
            "contact_id": contact_id,
            "account_type": "bank_account",
            "bank_account": {
                "name": (profile.bank_account_name or teacher.full_name or "Teacher")[:120],
                "ifsc": profile.bank_ifsc,
                "account_number": profile.bank_account_number,
            },
        },
        timeout=20,
    )
    resp.raise_for_status()
    fa_id = resp.json()["id"]
    profile.razorpay_fund_account_id = fa_id
    return fa_id


def _create_payout_live(fund_account_id: str, amount: float, reference_id: str, narration: str) -> dict:
    # RazorpayX narration must be alphanumeric + spaces only, max 30 chars.
    clean_narration = re.sub(r"[^a-zA-Z0-9 ]", " ", narration or "Earnings payout")
    clean_narration = re.sub(r"\s+", " ", clean_narration).strip()[:30] or "Earnings payout"
    resp = requests.post(
        f"{RAZORPAY_API}/payouts",
        auth=_auth(),
        json={
            "account_number": settings.razorpayx_account_number,
            "fund_account_id": fund_account_id,
            "amount": int(round(amount * 100)),  # paise
            "currency": "INR",
            "mode": "IMPS",
            "purpose": "payout",
            "queue_if_low_balance": True,
            "reference_id": reference_id,
            "narration": clean_narration,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def disburse(db, payout, profile, teacher) -> dict:
    """Attempt to disburse a payout. Mutates `payout` (and possibly `profile`) in place.
    Caller is responsible for db.commit(). Returns a summary dict with a 'status' key
    that is one of: completed | processing | failed.
    """
    amount = float(payout.amount or 0)
    mode = payouts_mode()

    # ── Simulated: mark completed immediately, no external calls ──
    if mode == "simulated":
        payout.razorpay_payout_id = f"pout_sim_{uuid.uuid4().hex[:14]}"
        payout.status = "completed"
        payout.completed_at = datetime.now(timezone.utc)
        if not profile.razorpay_contact_id:
            profile.razorpay_contact_id = f"cont_sim_{uuid.uuid4().hex[:12]}"
        if not profile.razorpay_fund_account_id:
            profile.razorpay_fund_account_id = f"fa_sim_{uuid.uuid4().hex[:12]}"
        return {"status": "completed", "mode": "simulated", "payout_id": payout.razorpay_payout_id}

    # ── Live: real RazorpayX disbursement ──
    if not profile.bank_account_number or not profile.bank_ifsc:
        payout.status = "failed"
        payout.failure_reason = "Bank account number and IFSC are required for payout"
        return {"status": "failed", "reason": payout.failure_reason}

    try:
        fa_id = _ensure_fund_account_live(profile, teacher)
        # RazorpayX caps reference_id at 40 chars; uuid hex (32) + prefix stays within it.
        reference_id = f"po_{payout.id.hex}"
        resp = _create_payout_live(
            fa_id, amount, reference_id, f"{settings.platform_name} earnings"
        )
        payout.razorpay_payout_id = resp.get("id")
        rzp_status = (resp.get("status") or "processing").lower()
        if rzp_status in _SUCCESS_TERMINAL:
            payout.status = "completed"
            payout.completed_at = datetime.now(timezone.utc)
        elif rzp_status in _FAIL_TERMINAL:
            payout.status = "failed"
            payout.failure_reason = f"RazorpayX status: {rzp_status}"
        else:
            # queued / pending / processing → reconcile later via webhook
            payout.status = "processing"
        return {"status": payout.status, "mode": "live", "payout_id": payout.razorpay_payout_id, "rzp_status": rzp_status}

    except requests.HTTPError as e:
        detail = ""
        try:
            detail = e.response.json().get("error", {}).get("description", "")
        except Exception:
            detail = str(e)
        payout.status = "failed"
        payout.failure_reason = detail or "RazorpayX payout request failed"
        return {"status": "failed", "reason": payout.failure_reason}
    except Exception as e:
        payout.status = "failed"
        payout.failure_reason = str(e)[:480]
        return {"status": "failed", "reason": payout.failure_reason}
