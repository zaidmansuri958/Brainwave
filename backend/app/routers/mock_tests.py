import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List, Any

from app.database import get_db
from app.middleware.auth_middleware import get_current_user, get_current_teacher, get_current_verified_teacher
from app.models.user import User
from app.models.mock_exam import (
    MockTestPackage,
    MockTestPaper,
    MockTestSection,
    MockTestQuestion,
    MockTestPurchase,
    MockTestAttempt,
    MockTestReview,
)
from app.services.payment_service import create_razorpay_order, verify_razorpay_signature, create_pending_payment, finalize_payment


router = APIRouter(prefix="/mock-tests", tags=["MockTests"])


def _slug(title: str) -> str:
    s = re.sub(r"[^a-z0-9\s-]", "", title.lower())
    s = re.sub(r"[\s]+", "-", s)
    return s + "-" + str(uuid.uuid4())[:8]


class PackageCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float


@router.post("/packages")
async def create_package(
    data: PackageCreate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    p = MockTestPackage(
        teacher_id=current_user.id,
        title=data.title,
        slug=_slug(data.title),
        description=data.description,
        price=data.price,
        status="draft",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": str(p.id), "slug": p.slug}


class PaperIn(BaseModel):
    title: str
    time_limit_minutes: int
    total_marks: Optional[float] = None
    marks_per_question: float = 1.0
    negative_marks: float = 0.0
    order_index: int = 0


@router.post("/packages/{package_id}/papers")
async def add_paper(
    package_id: str,
    data: PaperIn,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    pkg = db.query(MockTestPackage).filter(
        MockTestPackage.id == package_id, MockTestPackage.teacher_id == current_user.id
    ).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    paper = MockTestPaper(
        package_id=package_id,
        title=data.title,
        time_limit_minutes=data.time_limit_minutes,
        total_marks=data.total_marks,
        marks_per_question=data.marks_per_question,
        negative_marks=data.negative_marks,
        order_index=data.order_index,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return {"id": str(paper.id)}


class SectionIn(BaseModel):
    title: str
    order_index: int = 0


@router.post("/papers/{paper_id}/sections")
async def add_section(
    paper_id: str,
    data: SectionIn,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    if not pkg or str(pkg.teacher_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    sec = MockTestSection(paper_id=paper_id, title=data.title, order_index=data.order_index)
    db.add(sec)
    db.commit()
    db.refresh(sec)
    return {"id": str(sec.id)}


class QuestionIn(BaseModel):
    question_text: str
    question_type: str = "mcq"
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    marks: float = 1
    order_index: int = 0


@router.post("/sections/{section_id}/questions")
async def add_question(
    section_id: str,
    data: QuestionIn,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    sec = db.query(MockTestSection).filter(MockTestSection.id == section_id).first()
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == sec.paper_id).first()
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    if not pkg or str(pkg.teacher_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    q = MockTestQuestion(
        section_id=section_id,
        question_text=data.question_text,
        question_type=data.question_type,
        options=data.options,
        correct_answer=data.correct_answer,
        marks=data.marks,
        order_index=data.order_index,
    )
    db.add(q)
    db.commit()
    return {"id": str(q.id)}


@router.post("/packages/{package_id}/publish")
async def publish_package(
    package_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    pkg = db.query(MockTestPackage).filter(
        MockTestPackage.id == package_id, MockTestPackage.teacher_id == current_user.id
    ).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    pkg.status = "published"
    pkg.moderation_status = "approved"
    db.commit()
    return {"message": "published"}


@router.get("/teacher/my-packages")
async def my_teacher_packages(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    rows = db.query(MockTestPackage).filter(MockTestPackage.teacher_id == current_user.id).all()
    return {
        "packages": [
            {
                "id": str(r.id),
                "title": r.title,
                "slug": r.slug,
                "price": float(r.price),
                "status": r.status,
            }
            for r in rows
        ]
    }


@router.get("/packages/{package_id}/builder")
async def package_builder_detail(
    package_id: str,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    pkg = db.query(MockTestPackage).filter(
        MockTestPackage.id == package_id, MockTestPackage.teacher_id == current_user.id
    ).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    papers = db.query(MockTestPaper).filter(MockTestPaper.package_id == package_id).order_by(MockTestPaper.order_index).all()
    out_papers = []
    for p in papers:
        secs = db.query(MockTestSection).filter(MockTestSection.paper_id == p.id).order_by(MockTestSection.order_index).all()
        out_secs = []
        for s in secs:
            qs = db.query(MockTestQuestion).filter(MockTestQuestion.section_id == s.id).order_by(MockTestQuestion.order_index).all()
            out_secs.append(
                {
                    "id": str(s.id),
                    "title": s.title,
                    "order_index": s.order_index,
                    "questions": [
                        {
                            "id": str(q.id),
                            "question_text": q.question_text,
                            "question_type": q.question_type,
                            "options": q.options,
                            "correct_answer": q.correct_answer,
                            "marks": float(q.marks or 0),
                            "order_index": q.order_index,
                        }
                        for q in qs
                    ],
                }
            )
        out_papers.append(
            {
                "id": str(p.id),
                "title": p.title,
                "time_limit_minutes": p.time_limit_minutes,
                "total_marks": float(p.total_marks) if p.total_marks is not None else None,
                "marks_per_question": float(p.marks_per_question or 1),
                "negative_marks": float(p.negative_marks or 0),
                "order_index": p.order_index,
                "sections": out_secs,
            }
        )
    return {
        "id": str(pkg.id),
        "title": pkg.title,
        "slug": pkg.slug,
        "description": pkg.description,
        "price": float(pkg.price),
        "status": pkg.status,
        "papers": out_papers,
    }


@router.get("/slug/{slug}")
async def package_by_slug(slug: str, db: Session = Depends(get_db)):
    pkg = db.query(MockTestPackage).filter(MockTestPackage.slug == slug).first()
    if not pkg or pkg.status != "published":
        raise HTTPException(status_code=404, detail="Not found")
    papers = db.query(MockTestPaper).filter(MockTestPaper.package_id == pkg.id).order_by(MockTestPaper.order_index).all()
    return {
        "id": str(pkg.id),
        "title": pkg.title,
        "slug": pkg.slug,
        "description": pkg.description,
        "price": float(pkg.price),
        "currency": pkg.currency,
        "teacher_id": str(pkg.teacher_id),
        "papers": [
            {
                "id": str(p.id),
                "title": p.title,
                "time_limit_minutes": p.time_limit_minutes,
                "total_marks": float(p.total_marks) if p.total_marks is not None else None,
                "marks_per_question": float(p.marks_per_question or 1),
                "negative_marks": float(p.negative_marks or 0),
            }
            for p in papers
        ],
    }


@router.get("/papers/{paper_id}/take")
async def get_paper_for_take(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    pur = (
        db.query(MockTestPurchase)
        .filter(
            MockTestPurchase.student_id == current_user.id,
            MockTestPurchase.package_id == pkg.id,
        )
        .first()
    )
    if not pur:
        raise HTTPException(status_code=403, detail="Purchase required")
    secs = db.query(MockTestSection).filter(MockTestSection.paper_id == paper_id).order_by(MockTestSection.order_index).all()
    out_secs = []
    for s in secs:
        qs = db.query(MockTestQuestion).filter(MockTestQuestion.section_id == s.id).order_by(MockTestQuestion.order_index).all()
        out_secs.append(
            {
                "id": str(s.id),
                "title": s.title,
                "questions": [
                    {
                        "id": str(q.id),
                        "question_text": q.question_text,
                        "question_type": q.question_type,
                        "options": q.options,
                        "marks": float(q.marks or 0),
                        "order_index": q.order_index,
                    }
                    for q in qs
                ],
            }
        )
    return {
        "paper_id": str(paper.id),
        "title": paper.title,
        "time_limit_minutes": paper.time_limit_minutes,
        "marks_per_question": float(paper.marks_per_question or 1),
        "negative_marks": float(paper.negative_marks or 0),
        "total_marks": float(paper.total_marks) if paper.total_marks is not None else None,
        "sections": out_secs,
    }


@router.get("/catalog")
async def catalog(db: Session = Depends(get_db)):
    rows = db.query(MockTestPackage).filter(MockTestPackage.status == "published").all()

    out = []
    for r in rows:
        papers = (
            db.query(MockTestPaper)
            .filter(MockTestPaper.package_id == r.id)
            .order_by(MockTestPaper.order_index)
            .all()
        )
        paper_ids = [p.id for p in papers]
        total_duration = sum(int(p.time_limit_minutes or 0) for p in papers)
        total_marks = sum(float(p.total_marks or 0) for p in papers)

        # Count questions across all sections of all papers in one query
        questions_count = 0
        if paper_ids:
            section_ids = [
                s.id
                for s in db.query(MockTestSection.id)
                .filter(MockTestSection.paper_id.in_(paper_ids))
                .all()
            ]
            if section_ids:
                questions_count = (
                    db.query(func.count(MockTestQuestion.id))
                    .filter(MockTestQuestion.section_id.in_(section_ids))
                    .scalar()
                    or 0
                )

        teacher = r.teacher
        out.append(
            {
                "id": str(r.id),
                "title": r.title,
                "slug": r.slug,
                "description": r.description,
                "price": float(r.price),
                "currency": r.currency,
                "teacher_id": str(r.teacher_id),
                "teacher_name": (teacher.full_name if teacher else None),
                "papers_count": len(papers),
                "total_duration_minutes": total_duration,
                "total_questions": int(questions_count),
                "total_marks": total_marks,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
        )

    return {"packages": out}


class MockPurchaseConfirm(BaseModel):
    package_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/purchase/initiate")
async def purchase_initiate(
    package_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == package_id).first()
    if not pkg or pkg.status != "published":
        raise HTTPException(status_code=404, detail="Not found")
    ex = (
        db.query(MockTestPurchase)
        .filter(
            MockTestPurchase.student_id == current_user.id,
            MockTestPurchase.package_id == package_id,
        )
        .first()
    )
    if ex:
        raise HTTPException(status_code=400, detail="Already purchased")
    price = float(pkg.price or 0)
    if price <= 0:
        # Free package — grant access immediately without a Razorpay round-trip.
        db.add(MockTestPurchase(student_id=current_user.id, package_id=pkg.id, payment_id=None, amount_paid=0))
        db.commit()
        return {"free": True, "enrolled": True}
    order = create_razorpay_order(price)
    create_pending_payment(
        db,
        payer_id=str(current_user.id),
        payee_id=str(pkg.teacher_id),
        payment_type="mock_test",
        reference_id=str(pkg.id),
        razorpay_order_id=order["id"],
        total_amount=price,
        currency=pkg.currency,
    )
    return {"razorpay_order_id": order["id"], "amount": price, "currency": pkg.currency}


@router.post("/purchase/confirm")
async def purchase_confirm(
    data: MockPurchaseConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_razorpay_signature(data.razorpay_payment_id, data.razorpay_order_id, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment")
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == data.package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    # Idempotency: a replayed confirm must not create a second purchase / payment.
    existing = db.query(MockTestPurchase).filter(
        MockTestPurchase.student_id == current_user.id,
        MockTestPurchase.package_id == pkg.id,
    ).first()
    if existing:
        return {"success": True}
    pay = finalize_payment(
        db,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        payer_id=str(current_user.id),
        reference_id=str(data.package_id),
    )
    db.add(
        MockTestPurchase(
            student_id=current_user.id,
            package_id=pkg.id,
            payment_id=pay.id,
            amount_paid=pay.total_amount,
        )
    )
    db.commit()
    return {"success": True}


class AttemptSubmit(BaseModel):
    answers: dict
    time_taken_seconds: Optional[int] = None


@router.post("/papers/{paper_id}/attempt")
async def submit_attempt(
    paper_id: str,
    data: AttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    pur = (
        db.query(MockTestPurchase)
        .filter(
            MockTestPurchase.student_id == current_user.id,
            MockTestPurchase.package_id == pkg.id,
        )
        .first()
    )
    if not pur:
        raise HTTPException(status_code=403, detail="Purchase required")
    # Single source of truth for scoring — identical to the analytics/results path,
    # so the immediate result screen and the detailed results page can never disagree.
    bd = _score_breakdown(paper, data.answers or {}, db)
    from datetime import datetime, timezone

    att = MockTestAttempt(
        student_id=current_user.id,
        paper_id=paper_id,
        answers=data.answers,
        score_percent=bd["score_percent"],
        total_score=bd["total_score"],
        time_taken_seconds=data.time_taken_seconds,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return {
        "attempt_id": str(att.id),
        "score_percent": bd["score_percent"],
        "total_score": bd["total_score"],
        "max_score": bd["max_score"],
        "correct_count": bd["correct_count"],
        "wrong_count": bd["wrong_count"],
        "skipped_count": bd["skipped_count"],
        "penalty_deducted": bd["penalty_deducted"],
        "time_taken_seconds": data.time_taken_seconds,
    }


class PackageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None


@router.patch("/packages/{package_id}")
async def update_package(
    package_id: str,
    data: PackageUpdate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    pkg = db.query(MockTestPackage).filter(
        MockTestPackage.id == package_id, MockTestPackage.teacher_id == current_user.id
    ).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(pkg, k, v)
    db.commit()
    return {"message": "updated"}


@router.delete("/packages/{package_id}")
async def delete_package(
    package_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    pkg = db.query(MockTestPackage).filter(
        MockTestPackage.id == package_id, MockTestPackage.teacher_id == current_user.id
    ).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    pkg.status = "archived"
    db.commit()
    return {"message": "Package archived"}


class PaperUpdate(BaseModel):
    title: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    total_marks: Optional[float] = None
    marks_per_question: Optional[float] = None
    negative_marks: Optional[float] = None
    order_index: Optional[int] = None


@router.patch("/papers/{paper_id}")
async def update_paper(
    paper_id: str,
    data: PaperUpdate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Not found")
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    if not pkg or str(pkg.teacher_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    for k, v in data.dict(exclude_none=True).items():
        setattr(paper, k, v)
    db.commit()
    return {"message": "updated"}


@router.delete("/papers/{paper_id}")
async def delete_paper(
    paper_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Not found")
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    if not pkg or str(pkg.teacher_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted"}


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    marks: Optional[float] = None
    order_index: Optional[int] = None


@router.patch("/questions/{question_id}")
async def update_question(
    question_id: str,
    data: QuestionUpdate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    q = db.query(MockTestQuestion).filter(MockTestQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    sec = db.query(MockTestSection).filter(MockTestSection.id == q.section_id).first()
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == sec.paper_id).first()
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    if not pkg or str(pkg.teacher_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    for k, v in data.dict(exclude_none=True).items():
        setattr(q, k, v)
    db.commit()
    return {"message": "updated"}


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    q = db.query(MockTestQuestion).filter(MockTestQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Not found")
    sec = db.query(MockTestSection).filter(MockTestSection.id == q.section_id).first()
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == sec.paper_id).first()
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    if not pkg or str(pkg.teacher_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(q)
    db.commit()
    return {"message": "Question deleted"}


@router.get("/papers/{paper_id}/attempts")
async def list_attempts(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempts = db.query(MockTestAttempt).filter(
        MockTestAttempt.paper_id == paper_id,
        MockTestAttempt.student_id == current_user.id
    ).order_by(MockTestAttempt.submitted_at.desc()).all()
    return {
        "attempts": [
            {
                "id": str(a.id),
                "score_percent": float(a.score_percent or 0),
                "total_score": float(a.total_score or 0),
                "time_taken_seconds": a.time_taken_seconds,
                "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
            }
            for a in attempts
        ]
    }


@router.get("/papers/{paper_id}/attempts/{attempt_id}")
async def get_attempt_detail(
    paper_id: str,
    attempt_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempt = db.query(MockTestAttempt).filter(
        MockTestAttempt.id == attempt_id,
        MockTestAttempt.paper_id == paper_id,
        MockTestAttempt.student_id == current_user.id
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    # Build per-question review
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    sections = db.query(MockTestSection).filter(MockTestSection.paper_id == paper_id).all()
    review = []
    for sec in sections:
        questions = db.query(MockTestQuestion).filter(MockTestQuestion.section_id == sec.id).all()
        for q in questions:
            student_ans = (attempt.answers or {}).get(str(q.id), "")
            correct = str(q.correct_answer or "").lower().strip()
            is_correct = str(student_ans).lower().strip() == correct
            review.append({
                "question_id": str(q.id),
                "question_text": q.question_text,
                "student_answer": student_ans,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "marks": float(q.marks or 0),
                "section_title": sec.title,
            })

    return {
        "attempt_id": str(attempt.id),
        "score_percent": float(attempt.score_percent or 0),
        "total_score": float(attempt.total_score or 0),
        "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
        "review": review,
    }


@router.get("/my-packages")
async def my_packages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(MockTestPurchase).filter(MockTestPurchase.student_id == current_user.id).all()
    out = []
    for r in rows:
        pkg = r.package
        papers = (
            db.query(MockTestPaper)
            .filter(MockTestPaper.package_id == r.package_id)
            .order_by(MockTestPaper.order_index)
            .all()
        )
        total_duration = sum(int(p.time_limit_minutes or 0) for p in papers)
        out.append(
            {
                "package_id": str(r.package_id),
                "title": pkg.title if pkg else "",
                "slug": pkg.slug if pkg else None,
                "purchased_at": r.purchased_at.isoformat() if r.purchased_at else None,
                "total_duration_minutes": total_duration,
                "papers": [
                    {
                        "id": str(p.id),
                        "title": p.title,
                        "time_limit_minutes": p.time_limit_minutes,
                        "total_marks": float(p.total_marks) if p.total_marks is not None else None,
                    }
                    for p in papers
                ],
            }
        )
    return {"packages": out}


# ──────────────────────────────────────────────────────────────────────────
# Analytics helpers
# ──────────────────────────────────────────────────────────────────────────
def _score_breakdown(paper: MockTestPaper, answers: dict, db: Session) -> dict:
    """Recompute a single attempt's score + per-section breakdown from stored answers."""
    answers = answers or {}
    marks_per_q = float(paper.marks_per_question or 1)
    neg_per_q = float(paper.negative_marks or 0)
    sections = (
        db.query(MockTestSection)
        .filter(MockTestSection.paper_id == paper.id)
        .order_by(MockTestSection.order_index)
        .all()
    )
    total_marks = earned = 0.0
    correct = wrong = skipped = total_q = attempted = 0
    section_rows = []
    for sec in sections:
        questions = (
            db.query(MockTestQuestion)
            .filter(MockTestQuestion.section_id == sec.id)
            .order_by(MockTestQuestion.order_index)
            .all()
        )
        s_correct = s_wrong = s_skipped = 0
        s_total = len(questions)
        s_earned = 0.0
        s_max = 0.0
        for q in questions:
            q_marks = float(q.marks or marks_per_q)
            total_marks += q_marks
            s_max += q_marks
            total_q += 1
            ans = answers.get(str(q.id), "")
            is_blank = not ans or str(ans).strip() == ""
            is_correct = (not is_blank) and str(ans).lower().strip() == str(q.correct_answer or "").lower().strip()
            if is_blank:
                skipped += 1
                s_skipped += 1
            elif is_correct:
                correct += 1
                s_correct += 1
                attempted += 1
                earned += q_marks
                s_earned += q_marks
            else:
                wrong += 1
                s_wrong += 1
                attempted += 1
                earned -= neg_per_q
                s_earned -= neg_per_q
        section_rows.append({
            "section_id": str(sec.id),
            "title": sec.title,
            "total_questions": s_total,
            "correct": s_correct,
            "wrong": s_wrong,
            "skipped": s_skipped,
            "score": round(max(0.0, s_earned), 2),
            "max_score": round(s_max, 2),
            "accuracy": round((s_correct / (s_correct + s_wrong) * 100), 1) if (s_correct + s_wrong) > 0 else 0.0,
        })
    net = max(0.0, earned)
    return {
        "total_score": round(net, 2),
        "max_score": round(total_marks, 2),
        "score_percent": round((net / total_marks * 100), 2) if total_marks > 0 else 0.0,
        "correct_count": correct,
        "wrong_count": wrong,
        "skipped_count": skipped,
        "total_questions": total_q,
        "attempted": attempted,
        "accuracy": round((correct / attempted * 100), 1) if attempted > 0 else 0.0,
        "penalty_deducted": round(wrong * neg_per_q, 2),
        "sections": section_rows,
    }


def _best_attempts_for_paper(paper_id: str, db: Session):
    """Return the single best (highest total_score) submitted attempt per student for a paper."""
    rows = (
        db.query(MockTestAttempt)
        .filter(MockTestAttempt.paper_id == paper_id, MockTestAttempt.submitted_at.isnot(None))
        .all()
    )
    best = {}
    for a in rows:
        sid = str(a.student_id)
        score = float(a.total_score or 0)
        if sid not in best or score > float(best[sid].total_score or 0):
            best[sid] = a
    return list(best.values())


@router.get("/papers/{paper_id}/leaderboard")
async def paper_leaderboard(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    # Gate the leaderboard (which exposes other students' names/scores) behind purchase.
    pkg = db.query(MockTestPackage).filter(MockTestPackage.id == paper.package_id).first()
    is_owner = current_user.role == "admin" or (pkg and str(pkg.teacher_id) == str(current_user.id))
    if not is_owner:
        owned = (
            db.query(MockTestPurchase)
            .filter(
                MockTestPurchase.student_id == current_user.id,
                MockTestPurchase.package_id == paper.package_id,
            )
            .first()
        )
        if not owned:
            raise HTTPException(status_code=403, detail="Purchase required to view the leaderboard")

    best = _best_attempts_for_paper(paper_id, db)
    best.sort(key=lambda a: float(a.total_score or 0), reverse=True)
    total_students = len(best)

    # Resolve names in one query
    student_ids = [a.student_id for a in best]
    users = {}
    if student_ids:
        for u in db.query(User).filter(User.id.in_(student_ids)).all():
            users[str(u.id)] = u

    entries = []
    my_rank = None
    my_score = None
    for idx, a in enumerate(best):
        rank = idx + 1
        sid = str(a.student_id)
        u = users.get(sid)
        is_me = sid == str(current_user.id)
        if is_me:
            my_rank = rank
            my_score = float(a.total_score or 0)
        entries.append({
            "rank": rank,
            "student_id": sid,
            "student_name": (u.full_name if u else "Student"),
            "student_avatar": (u.avatar_url if u else None),
            "total_score": float(a.total_score or 0),
            "score_percent": float(a.score_percent or 0),
            "time_taken_seconds": a.time_taken_seconds,
            "is_me": is_me,
        })

    scores = [float(a.total_score or 0) for a in best]
    highest = max(scores) if scores else 0.0
    average = round(sum(scores) / len(scores), 2) if scores else 0.0
    ahead_of = (total_students - my_rank) if my_rank else 0
    percentile = round(((total_students - my_rank) / total_students) * 100, 1) if (my_rank and total_students > 1) else (100.0 if my_rank == 1 and total_students == 1 else 0.0)

    # Score distribution histogram (10 buckets across max possible marks)
    max_marks = float(paper.total_marks or (max(scores) if scores else 100)) or 100
    buckets = [0] * 10
    for s in scores:
        b = min(9, int((s / max_marks) * 10)) if max_marks > 0 else 0
        buckets[b] += 1
    distribution = [
        {"range": f"{int(i*10)}-{int((i+1)*10)}%", "count": buckets[i]}
        for i in range(10)
    ]

    return {
        "paper_id": str(paper.id),
        "paper_title": paper.title,
        "total_students": total_students,
        "highest_score": round(highest, 2),
        "average_score": average,
        "max_marks": round(max_marks, 2),
        "my_rank": my_rank,
        "my_score": my_score,
        "ahead_of": ahead_of,
        "percentile": percentile,
        "topper": entries[0] if entries else None,
        "leaderboard": entries[:50],
        "distribution": distribution,
    }


@router.get("/papers/{paper_id}/analytics")
async def paper_analytics(
    paper_id: str,
    attempt_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    paper = db.query(MockTestPaper).filter(MockTestPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    q = db.query(MockTestAttempt).filter(
        MockTestAttempt.paper_id == paper_id,
        MockTestAttempt.student_id == current_user.id,
        MockTestAttempt.submitted_at.isnot(None),
    )
    if attempt_id:
        attempt = q.filter(MockTestAttempt.id == attempt_id).first()
    else:
        attempt = q.order_by(MockTestAttempt.submitted_at.desc()).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="No attempt found")

    breakdown = _score_breakdown(paper, attempt.answers, db)

    # Cohort comparison: per-section average accuracy across all students' best attempts
    cohort = _best_attempts_for_paper(paper_id, db)
    section_avgs = {}
    if cohort:
        agg = {}
        for a in cohort:
            bd = _score_breakdown(paper, a.answers, db)
            for s in bd["sections"]:
                agg.setdefault(s["section_id"], []).append(s["accuracy"])
        for sid, vals in agg.items():
            section_avgs[sid] = round(sum(vals) / len(vals), 1) if vals else 0.0

    sections = []
    for s in breakdown["sections"]:
        sections.append({**s, "cohort_avg_accuracy": section_avgs.get(s["section_id"], 0.0)})

    # Strengths / weaknesses
    ranked = sorted(breakdown["sections"], key=lambda x: x["accuracy"], reverse=True)
    strengths = [s["title"] for s in ranked if s["accuracy"] >= 60][:3]
    weaknesses = [s["title"] for s in reversed(ranked) if s["accuracy"] < 60][:3]

    return {
        "attempt_id": str(attempt.id),
        "paper_id": str(paper.id),
        "paper_title": paper.title,
        "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
        "time_taken_seconds": attempt.time_taken_seconds,
        "time_limit_minutes": paper.time_limit_minutes,
        **breakdown,
        "sections": sections,
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


# ──────────────────────────────────────────────────────────────────────────
# Package stats (public) + Reviews
# ──────────────────────────────────────────────────────────────────────────
@router.get("/slug/{slug}/stats")
async def package_stats(slug: str, db: Session = Depends(get_db)):
    pkg = db.query(MockTestPackage).filter(MockTestPackage.slug == slug).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")

    paper_ids = [p.id for p in db.query(MockTestPaper.id).filter(MockTestPaper.package_id == pkg.id).all()]

    enrolled = db.query(func.count(MockTestPurchase.id)).filter(MockTestPurchase.package_id == pkg.id).scalar() or 0

    total_attempts = 0
    distinct_test_takers = set()
    highest = 0.0
    score_sum = 0.0
    score_n = 0
    if paper_ids:
        attempts = (
            db.query(MockTestAttempt)
            .filter(MockTestAttempt.paper_id.in_(paper_ids), MockTestAttempt.submitted_at.isnot(None))
            .all()
        )
        total_attempts = len(attempts)
        for a in attempts:
            distinct_test_takers.add(str(a.student_id))
            sp = float(a.score_percent or 0)
            score_sum += sp
            score_n += 1
            highest = max(highest, sp)

    avg_rating = db.query(func.avg(MockTestReview.rating)).filter(MockTestReview.package_id == pkg.id).scalar() or 0
    review_count = db.query(func.count(MockTestReview.id)).filter(MockTestReview.package_id == pkg.id).scalar() or 0

    return {
        "enrolled_count": int(enrolled),
        "test_takers": len(distinct_test_takers),
        "total_attempts": total_attempts,
        "avg_score_percent": round(score_sum / score_n, 1) if score_n else 0.0,
        "highest_score_percent": round(highest, 1),
        "avg_rating": round(float(avg_rating), 2),
        "review_count": int(review_count),
    }


@router.get("/packages/{package_id}/reviews")
async def get_package_reviews(package_id: str, db: Session = Depends(get_db)):
    reviews = (
        db.query(MockTestReview)
        .filter(MockTestReview.package_id == package_id)
        .order_by(MockTestReview.created_at.desc())
        .all()
    )
    avg = db.query(func.avg(MockTestReview.rating)).filter(MockTestReview.package_id == package_id).scalar() or 0
    return {
        "avg_rating": round(float(avg), 2),
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": str(r.id),
                "student_id": str(r.student_id),
                "student_name": r.student.full_name if r.student else "Anonymous",
                "student_avatar": r.student.avatar_url if r.student else None,
                "rating": r.rating,
                "review_text": r.review_text,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reviews
        ],
    }


class MockReviewIn(BaseModel):
    rating: int
    review_text: Optional[str] = None


@router.post("/packages/{package_id}/reviews")
async def submit_package_review(
    package_id: str,
    data: MockReviewIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    owns = (
        db.query(MockTestPurchase)
        .filter(MockTestPurchase.student_id == current_user.id, MockTestPurchase.package_id == package_id)
        .first()
    )
    if not owns:
        raise HTTPException(status_code=403, detail="You must own this package to review it")
    existing = (
        db.query(MockTestReview)
        .filter(MockTestReview.student_id == current_user.id, MockTestReview.package_id == package_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this package")
    review = MockTestReview(
        student_id=current_user.id,
        package_id=package_id,
        rating=data.rating,
        review_text=data.review_text,
    )
    db.add(review)
    db.commit()
    return {"message": "Review submitted"}


@router.patch("/packages/{package_id}/reviews/{review_id}")
async def update_package_review(
    package_id: str,
    review_id: str,
    data: MockReviewIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = (
        db.query(MockTestReview)
        .filter(
            MockTestReview.id == review_id,
            MockTestReview.package_id == package_id,
            MockTestReview.student_id == current_user.id,
        )
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if data.rating is not None:
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        review.rating = data.rating
    if data.review_text is not None:
        review.review_text = data.review_text
    db.commit()
    return {"message": "Review updated"}


@router.delete("/packages/{package_id}/reviews/{review_id}")
async def delete_package_review(
    package_id: str,
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = (
        db.query(MockTestReview)
        .filter(
            MockTestReview.id == review_id,
            MockTestReview.package_id == package_id,
            MockTestReview.student_id == current_user.id,
        )
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
