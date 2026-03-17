import httpx
import os
import redis
from tasks.celery_app import celery_app

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-services:8001")


def update_status(course_id: str, field: str, value: str):
    redis_client.hset(f"ai_status:{course_id}", field, value)


@celery_app.task(bind=True, max_retries=3)
def process_course_material(self, course_id: str, material_ids: list):
    """Full AI pipeline triggered after teacher uploads materials."""
    from app.database import SessionLocal
    from app.models.course import Course, CourseMaterial, Chapter, Lesson
    from app.models.quiz import Quiz, QuizQuestion
    import json

    db = SessionLocal()
    try:
        update_status(course_id, "ai_status", "processing")
        update_status(course_id, "ai_progress", "10")

        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return

        combined_content = ""
        
        for i, material_id in enumerate(material_ids):
            material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
            if not material:
                continue

            material.processing_status = "processing"
            db.commit()

            content = ""

            # Step 1: Download and transcribe/extract
            if material.file_type in ["video", "audio"]:
                try:
                    resp = httpx.post(
                        f"{AI_SERVICE_URL}/transcribe",
                        json={"file_url": material.file_url, "material_id": material_id},
                        timeout=600
                    )
                    if resp.status_code == 200:
                        content = resp.json().get("text", "")
                        update_status(course_id, "steps_completed", "transcription")
                        update_status(course_id, "ai_progress", "30")
                except Exception as e:
                    print(f"Transcription failed: {e}")

            elif material.file_type in ["pdf", "doc", "ppt"]:
                try:
                    resp = httpx.post(
                        f"{AI_SERVICE_URL}/extract-text",
                        json={"file_url": material.file_url, "file_type": material.file_type},
                        timeout=120
                    )
                    if resp.status_code == 200:
                        content = resp.json().get("text", "")
                except Exception as e:
                    print(f"Text extraction failed: {e}")

            combined_content += content + "\n\n"
            material.processing_status = "completed"
            db.commit()

        # Step 2: Structure course
        if combined_content and i == 0:
            try:
                resp = httpx.post(
                    f"{AI_SERVICE_URL}/structure-course",
                    json={"content": combined_content[:8000]},
                    timeout=180
                )
                if resp.status_code == 200:
                    structure = resp.json()
                    if isinstance(structure, str):
                        structure = json.loads(structure)

                    # Save to DB
                    save_course_structure(db, course, structure)
                    update_status(course_id, "steps_completed", "transcription,structuring")
                    update_status(course_id, "ai_progress", "55")
            except Exception as e:
                print(f"Course structuring failed: {e}")

        # Step 3: Generate quiz questions
        try:
            chapters = db.query(Chapter).filter(Chapter.course_id == course_id).all()
            for chapter in chapters:
                chapter_content = " ".join([l.ai_summary or l.title for l in chapter.lessons])
                if chapter_content:
                    resp = httpx.post(
                        f"{AI_SERVICE_URL}/generate-quiz",
                        json={"content": chapter_content, "num_questions": 5},
                        timeout=120
                    )
                    if resp.status_code == 200:
                        quiz_data = resp.json()
                        if isinstance(quiz_data, str):
                            quiz_data = json.loads(quiz_data)
                        save_quiz(db, course_id, chapter, quiz_data)
            update_status(course_id, "steps_completed", "transcription,structuring,quizzes")
            update_status(course_id, "ai_progress", "70")
        except Exception as e:
            print(f"Quiz generation failed: {e}")

        # Step 4: Index for chatbot (Qdrant)
        if combined_content:
            try:
                httpx.post(
                    f"{AI_SERVICE_URL}/index",
                    json={
                        "course_id": course_id,
                        "text": combined_content,
                        "lesson_id": str(course.id),
                        "chapter_id": str(course.id),
                        "source_type": "course_content"
                    },
                    timeout=300
                )
                update_status(course_id, "steps_completed", "transcription,structuring,quizzes,indexing")
                update_status(course_id, "ai_progress", "85")
            except Exception as e:
                print(f"Indexing failed: {e}")

        # Step 5: Generate thumbnail
        try:
            resp = httpx.post(
                f"{AI_SERVICE_URL}/generate-thumbnail",
                json={
                    "title": course.title,
                    "category": course.category or "Education",
                    "description": course.description or ""
                },
                timeout=120
            )
            if resp.status_code == 200:
                thumbnail_url = resp.json().get("thumbnail_url")
                if thumbnail_url:
                    course.thumbnail_url = thumbnail_url
                    db.commit()
            update_status(course_id, "steps_completed", "transcription,structuring,quizzes,indexing,thumbnail")
            update_status(course_id, "ai_progress", "95")
        except Exception as e:
            print(f"Thumbnail generation failed: {e}")

        # Final
        course.ai_processing_status = "completed"
        db.commit()
        update_status(course_id, "ai_progress", "100")
        update_status(course_id, "ai_status", "completed")

        # Notify teacher
        from app.services.notification_service import create_notification
        create_notification(
            db, str(course.teacher_id), "ai_processing_complete",
            "Course Processing Complete!",
            f"Your course '{course.title}' has been processed. Please review and publish.",
            {"course_id": course_id}
        )
        from tasks.email_tasks import notify_teacher_processing_complete
        notify_teacher_processing_complete.delay(course_id)

    except Exception as e:
        update_status(course_id, "ai_status", "failed")
        update_status(course_id, "error", str(e))
        course = db.query(Course).filter(Course.id == course_id).first()
        if course:
            course.ai_processing_status = "failed"
            db.commit()
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()


def save_course_structure(db, course, structure: dict):
    from app.models.course import Chapter, Lesson
    import uuid

    if isinstance(structure, str):
        import json
        structure = json.loads(structure)

    # Update course info
    if structure.get("course_title"):
        course.title = structure["course_title"]
    if structure.get("course_description"):
        course.description = structure["course_description"]
    if structure.get("short_description"):
        course.short_description = structure["short_description"]
    if structure.get("tags"):
        course.tags = structure["tags"]
    if structure.get("difficulty_level"):
        course.difficulty_level = structure["difficulty_level"]

    chapters_data = structure.get("chapters", [])
    for ch_data in chapters_data:
        chapter = Chapter(
            course_id=course.id,
            title=ch_data.get("title", "Chapter"),
            description=ch_data.get("description"),
            order_index=ch_data.get("order", 1)
        )
        db.add(chapter)
        db.flush()

        for lesson_data in ch_data.get("lessons", []):
            lesson = Lesson(
                chapter_id=chapter.id,
                course_id=course.id,
                title=lesson_data.get("title", "Lesson"),
                lesson_type="video",
                order_index=lesson_data.get("order", 1),
                ai_summary=lesson_data.get("summary"),
                is_published=True
            )
            db.add(lesson)

    course.total_chapters = len(chapters_data)
    db.commit()


def save_quiz(db, course_id: str, chapter, quiz_data: dict):
    from app.models.quiz import Quiz, QuizQuestion
    import uuid

    if isinstance(quiz_data, str):
        import json
        quiz_data = json.loads(quiz_data)

    questions_data = quiz_data.get("questions", [])
    if not questions_data:
        return

    quiz = Quiz(
        course_id=course_id,
        title=f"Quiz: {chapter.title}",
        max_attempts=3,
        pass_percent=60
    )
    db.add(quiz)
    db.flush()

    for i, q in enumerate(questions_data):
        question = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q.get("question_text", ""),
            question_type=q.get("question_type", "mcq"),
            options=q.get("options"),
            correct_answer=q.get("correct_answer"),
            explanation=q.get("explanation"),
            order_index=i,
            ai_generated=True
        )
        db.add(question)

    db.commit()
