import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
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
)
from app.services.payment_service import create_razorpay_order, verify_razorpay_signature, record_payment


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
        "papers": [{"id": str(p.id), "title": p.title, "time_limit_minutes": p.time_limit_minutes} for p in papers],
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
        "sections": out_secs,
    }


@router.get("/catalog")
async def catalog(db: Session = Depends(get_db)):
    rows = db.query(MockTestPackage).filter(MockTestPackage.status == "published").all()
    return {
        "packages": [
            {
                "id": str(r.id),
                "title": r.title,
                "slug": r.slug,
                "price": float(r.price),
                "teacher_id": str(r.teacher_id),
            }
            for r in rows
        ]
    }


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
    order = create_razorpay_order(float(pkg.price))
    return {"razorpay_order_id": order["id"], "amount": float(pkg.price), "currency": pkg.currency}


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
    pay = record_payment(
        db,
        payer_id=str(current_user.id),
        payee_id=str(pkg.teacher_id),
        payment_type="mock_test",
        reference_id=data.package_id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        total_amount=float(pkg.price),
        currency=pkg.currency,
        tier_enrollment_count=None,
    )
    db.add(
        MockTestPurchase(
            student_id=current_user.id,
            package_id=pkg.id,
            payment_id=pay.id,
            amount_paid=pkg.price,
        )
    )
    db.commit()
    return {"success": True}


class AttemptSubmit(BaseModel):
    answers: dict


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
    sections = db.query(MockTestSection).filter(MockTestSection.paper_id == paper_id).all()
    total = 0.0
    earned = 0.0
    for sec in sections:
        questions = (
            db.query(MockTestQuestion).filter(MockTestQuestion.section_id == sec.id).order_by(MockTestQuestion.order_index).all()
        )
        for q in questions:
            total += float(q.marks or 0)
            ans = (data.answers or {}).get(str(q.id), "")
            if q.question_type in ("mcq", "mcq_multi"):
                if str(ans).lower().strip() == str(q.correct_answer or "").lower().strip():
                    earned += float(q.marks or 0)
            elif ans and q.correct_answer and str(ans).lower() in str(q.correct_answer).lower():
                earned += float(q.marks or 0) * 0.5
    pct = (earned / total * 100) if total > 0 else 0
    from datetime import datetime, timezone

    att = MockTestAttempt(
        student_id=current_user.id,
        paper_id=paper_id,
        answers=data.answers,
        score_percent=round(pct, 2),
        total_score=earned,
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(att)
    db.commit()
    return {"score_percent": round(pct, 2), "total_score": earned, "max_score": total}


@router.get("/my-packages")
async def my_packages(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(MockTestPurchase).filter(MockTestPurchase.student_id == current_user.id).all()
    out = []
    for r in rows:
        pkg = r.package
        papers = db.query(MockTestPaper).filter(MockTestPaper.package_id == r.package_id).all()
        out.append(
            {
                "package_id": str(r.package_id),
                "title": pkg.title if pkg else "",
                "papers": [{"id": str(p.id), "title": p.title} for p in papers],
            }
        )
    return {"packages": out}
