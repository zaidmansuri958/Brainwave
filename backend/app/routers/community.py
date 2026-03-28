from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.community import CommunityPost, CommunityReply
from app.models.enrollment import Enrollment
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.services.notification_service import create_notification
from typing import Optional

router = APIRouter(prefix="/community", tags=["Community"])


class PostCreate(BaseModel):
    content: str
    post_type: str = "discussion"


class ReplyCreate(BaseModel):
    content: str


def check_course_access(db: Session, user: User, course_id: str):
    # All teachers can access any course community (to help students)
    if user.role in ("teacher", "admin"):
        return True
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == user.id,
        Enrollment.course_id == course_id,
        Enrollment.is_active == True
    ).first()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Must be enrolled to access community")
    return True


@router.get("/{course_id}/posts")
async def get_posts(
    course_id: str,
    page: int = 1,
    limit: int = 20,
    post_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_course_access(db, current_user, course_id)

    query = db.query(CommunityPost).filter(CommunityPost.course_id == course_id)
    if post_type:
        query = query.filter(CommunityPost.post_type == post_type)

    total = query.count()
    posts = query.order_by(
        CommunityPost.is_pinned.desc(),
        CommunityPost.created_at.desc()
    ).offset((page - 1) * limit).limit(limit).all()

    result = []
    for post in posts:
        result.append({
            "id": str(post.id),
            "content": post.content,
            "post_type": post.post_type,
            "is_pinned": post.is_pinned,
            "upvote_count": post.upvotes,
            "created_at": post.created_at.isoformat(),
            "user": {
                "id": str(post.author_id),
                "full_name": post.author.full_name if post.author else "Unknown",
                "avatar_url": post.author.avatar_url if post.author else None,
                "role": post.author.role if post.author else "student"
            },
            "replies": [
                {
                    "id": str(r.id),
                    "content": r.content,
                    "is_official_answer": r.is_official_answer,
                    "created_at": r.created_at.isoformat(),
                    "user": {
                        "id": str(r.author_id),
                        "full_name": r.author.full_name if r.author else "Unknown",
                        "role": r.author.role if r.author else "student"
                    }
                }
                for r in post.replies
            ]
        })

    return {"posts": result, "total": total}


@router.post("/{course_id}/posts")
async def create_post(
    course_id: str,
    body: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_course_access(db, current_user, course_id)

    post = CommunityPost(
        course_id=course_id,
        author_id=current_user.id,
        content=body.content,
        post_type=body.post_type
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    if body.post_type == "doubt":
        from app.models.course import Course
        course = db.query(Course).filter(Course.id == course_id).first()
        if course:
            create_notification(
                db, str(course.teacher_id), "new_doubt",
                "New Doubt Posted",
                f"{current_user.full_name} posted a doubt in {course.title}",
                {"course_id": course_id, "post_id": str(post.id)}
            )

    return {
        "id": str(post.id),
        "content": post.content,
        "post_type": post.post_type,
        "created_at": post.created_at.isoformat()
    }


@router.post("/{course_id}/posts/{post_id}/replies")
async def create_reply(
    course_id: str,
    post_id: str,
    body: ReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_course_access(db, current_user, course_id)

    post = db.query(CommunityPost).filter(
        CommunityPost.id == post_id,
        CommunityPost.course_id == course_id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    reply = CommunityReply(
        post_id=post_id,
        author_id=current_user.id,
        content=body.content
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)

    return {
        "id": str(reply.id),
        "content": reply.content,
        "created_at": reply.created_at.isoformat()
    }


@router.get("/{course_id}/posts/{post_id}/replies")
async def get_replies(
    course_id: str,
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_course_access(db, current_user, course_id)

    replies = db.query(CommunityReply).filter(
        CommunityReply.post_id == post_id
    ).order_by(CommunityReply.created_at.asc()).all()

    return {
        "replies": [
            {
                "id": str(r.id),
                "content": r.content,
                "is_official_answer": r.is_official_answer,
                "is_ai_response": r.is_ai_response,
                "upvotes": r.upvotes,
                "created_at": r.created_at.isoformat(),
                "user": {
                    "id": str(r.author_id),
                    "full_name": r.author.full_name if r.author else "Unknown",
                    "role": r.author.role if r.author else "student"
                }
            }
            for r in replies
        ]
    }


@router.patch("/posts/{post_id}/replies/{reply_id}/official")
async def mark_official_answer(
    post_id: str,
    reply_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")

    reply = db.query(CommunityReply).filter(
        CommunityReply.id == reply_id,
        CommunityReply.post_id == post_id
    ).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    reply.is_official_answer = True
    db.commit()
    return {"message": "Marked as official answer"}


@router.post("/posts/{post_id}/upvote")
async def upvote_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.upvotes = (post.upvotes or 0) + 1
    db.commit()
    return {"upvotes": post.upvotes}


@router.patch("/posts/{post_id}/pin")
async def pin_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")

    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_pinned = not post.is_pinned
    db.commit()
    return {"is_pinned": post.is_pinned}
