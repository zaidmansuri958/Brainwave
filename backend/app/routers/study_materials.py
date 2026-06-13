import uuid
import re
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db
from app.middleware.auth_middleware import get_current_user, get_current_teacher, get_current_verified_teacher
from app.models.user import User
from app.models.study_material import StudyMaterialProduct, StudyMaterialFile, StudyMaterialPurchase
from app.services.storage_service import upload_file
from app.services.payment_service import create_razorpay_order, verify_razorpay_signature, create_pending_payment, finalize_payment
from app.services.notification_service import create_notification

router = APIRouter(prefix="/study-materials", tags=["StudyMaterials"])


def slugify(title: str) -> str:
    s = re.sub(r"[^a-z0-9\s-]", "", title.lower())
    s = re.sub(r"[\s]+", "-", s)
    return s + "-" + str(uuid.uuid4())[:8]


class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float


@router.post("")
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    p = StudyMaterialProduct(
        teacher_id=current_user.id,
        title=data.title,
        slug=slugify(data.title),
        description=data.description,
        price=data.price,
        status="draft",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": str(p.id), "slug": p.slug}


@router.post("/{product_id}/files")
async def upload_files(
    product_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    prod = db.query(StudyMaterialProduct).filter(
        StudyMaterialProduct.id == product_id, StudyMaterialProduct.teacher_id == current_user.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    for f in files:
        raw = await f.read()
        key = f"study-materials/{product_id}/{uuid.uuid4()}/{f.filename}"
        url = upload_file(raw, "course-materials", key, f.content_type or "application/octet-stream")
        ft = "pdf"
        if f.content_type and "pdf" in f.content_type:
            ft = "pdf"
        elif f.content_type and "word" in f.content_type:
            ft = "doc"
        row = StudyMaterialFile(product_id=product_id, file_name=f.filename, file_url=url, file_type=ft)
        db.add(row)
    db.commit()
    return {"message": "uploaded"}


@router.post("/{product_id}/publish")
async def publish_product(
    product_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    prod = db.query(StudyMaterialProduct).filter(
        StudyMaterialProduct.id == product_id, StudyMaterialProduct.teacher_id == current_user.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    prod.status = "published"
    prod.moderation_status = "approved"
    db.commit()
    return {"message": "published"}


@router.get("/teacher/my")
async def my_teacher_products(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    rows = db.query(StudyMaterialProduct).filter(StudyMaterialProduct.teacher_id == current_user.id).all()
    return {
        "products": [
            {
                "id": str(r.id),
                "title": r.title,
                "slug": r.slug,
                "price": float(r.price),
                "status": r.status,
                "moderation_status": r.moderation_status,
            }
            for r in rows
        ]
    }


@router.get("/slug/{slug}")
async def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    r = db.query(StudyMaterialProduct).filter(StudyMaterialProduct.slug == slug).first()
    if not r or r.status != "published":
        raise HTTPException(status_code=404, detail="Not found")
    files = [{"id": str(f.id), "file_name": f.file_name} for f in (r.files or [])]
    return {
        "id": str(r.id),
        "title": r.title,
        "slug": r.slug,
        "description": r.description,
        "price": float(r.price),
        "currency": r.currency,
        "teacher_id": str(r.teacher_id),
        "file_count": len(files),
    }


@router.get("/purchased/{product_id}/files")
async def purchased_files(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pur = (
        db.query(StudyMaterialPurchase)
        .filter(
            StudyMaterialPurchase.student_id == current_user.id,
            StudyMaterialPurchase.product_id == product_id,
        )
        .first()
    )
    if not pur:
        raise HTTPException(status_code=403, detail="Not purchased")
    prod = pur.product
    return {
        "files": [
            {"id": str(f.id), "file_name": f.file_name, "file_url": f.file_url, "file_type": f.file_type}
            for f in (prod.files or [])
        ]
    }


@router.get("/catalog")
async def catalog(db: Session = Depends(get_db)):
    rows = db.query(StudyMaterialProduct).filter(StudyMaterialProduct.status == "published").all()
    return {
        "items": [
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


class PurchaseConfirm(BaseModel):
    product_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/purchase/initiate")
async def purchase_initiate(
    product_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prod = db.query(StudyMaterialProduct).filter(StudyMaterialProduct.id == product_id).first()
    if not prod or prod.status != "published":
        raise HTTPException(status_code=404, detail="Not found")
    existing = (
        db.query(StudyMaterialPurchase)
        .filter(
            StudyMaterialPurchase.student_id == current_user.id,
            StudyMaterialPurchase.product_id == product_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already purchased")
    price = float(prod.price or 0)
    if price <= 0:
        # Free product — grant access immediately without a Razorpay round-trip.
        db.add(StudyMaterialPurchase(student_id=current_user.id, product_id=prod.id, payment_id=None, amount_paid=0))
        prod.enrolled_count = int(prod.enrolled_count or 0) + 1
        db.commit()
        return {"free": True, "enrolled": True}
    order = create_razorpay_order(price)
    create_pending_payment(
        db,
        payer_id=str(current_user.id),
        payee_id=str(prod.teacher_id),
        payment_type="study_material",
        reference_id=str(prod.id),
        razorpay_order_id=order["id"],
        total_amount=price,
        currency=prod.currency,
    )
    return {"razorpay_order_id": order["id"], "amount": price, "currency": prod.currency}


@router.post("/purchase/confirm")
async def purchase_confirm(
    data: PurchaseConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_razorpay_signature(data.razorpay_payment_id, data.razorpay_order_id, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment")
    prod = db.query(StudyMaterialProduct).filter(StudyMaterialProduct.id == data.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    # Idempotency: a replayed confirm must not create a second purchase / payment.
    existing = db.query(StudyMaterialPurchase).filter(
        StudyMaterialPurchase.student_id == current_user.id,
        StudyMaterialPurchase.product_id == prod.id,
    ).first()
    if existing:
        return {"success": True}
    pay = finalize_payment(
        db,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        payer_id=str(current_user.id),
        reference_id=str(data.product_id),
    )
    pur = StudyMaterialPurchase(
        student_id=current_user.id, product_id=prod.id, payment_id=pay.id, amount_paid=pay.total_amount
    )
    db.add(pur)
    prod.enrolled_count = int(prod.enrolled_count or 0) + 1
    db.commit()
    return {"success": True}


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None


@router.patch("/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdate,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    prod = db.query(StudyMaterialProduct).filter(
        StudyMaterialProduct.id == product_id, StudyMaterialProduct.teacher_id == current_user.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(prod, k, v)
    db.commit()
    return {"message": "updated"}


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    prod = db.query(StudyMaterialProduct).filter(
        StudyMaterialProduct.id == product_id, StudyMaterialProduct.teacher_id == current_user.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Not found")
    prod.status = "archived"
    db.commit()
    return {"message": "Product archived"}


@router.delete("/{product_id}/files/{file_id}")
async def delete_file(
    product_id: str,
    file_id: str,
    current_user: User = Depends(get_current_verified_teacher),
    db: Session = Depends(get_db),
):
    prod = db.query(StudyMaterialProduct).filter(
        StudyMaterialProduct.id == product_id, StudyMaterialProduct.teacher_id == current_user.id
    ).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    f = db.query(StudyMaterialFile).filter(
        StudyMaterialFile.id == file_id, StudyMaterialFile.product_id == product_id
    ).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    db.delete(f)
    db.commit()
    return {"message": "File deleted"}


@router.get("/my-purchases")
async def my_purchases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(StudyMaterialPurchase).filter(StudyMaterialPurchase.student_id == current_user.id).all()
    return {
        "purchases": [
            {
                "product_id": str(r.product_id),
                "title": r.product.title if r.product else "",
                "slug": r.product.slug if r.product else "",
                "purchased_at": r.purchased_at.isoformat(),
            }
            for r in rows
        ]
    }
