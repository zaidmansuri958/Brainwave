import httpx
import os
import redis
from tasks.celery_app import celery_app

redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-services:8001")


def update_status(course_id: str, **kwargs):
    for k, v in kwargs.items():
        redis_client.hset(f"ai_status:{course_id}", k, str(v))


def _segments_to_vtt(segments: list) -> str:
    """Convert Whisper segments [{start, end, text}] to WebVTT format."""
    lines = ["WEBVTT", ""]
    for i, seg in enumerate(segments):
        start = _fmt_vtt_time(seg.get("start", 0))
        end = _fmt_vtt_time(seg.get("end", 0))
        text = (seg.get("text") or "").strip()
        if text:
            lines.append(f"{i + 1}")
            lines.append(f"{start} --> {end}")
            lines.append(text)
            lines.append("")
    return "\n".join(lines)


def _fmt_vtt_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def _whisper_lang(course_language: str) -> str:
    """Map UI course language label to Whisper ISO 639-1 code."""
    if not course_language:
        return None
    m = {
        "English": "en",
        "Hindi": "hi",
        "Gujarati": "gu",
        "Tamil": "ta",
        "Telugu": "te",
        "Marathi": "mr",
        "Bengali": "bn",
        "Kannada": "kn",
        "Malayalam": "ml",
        "Punjabi": "pa",
        "Odia": "or",
        "Urdu": "ur",
    }
    return m.get(course_language)


def _resolve_transcription_language(course) -> str:
    """
    Course-level transcription language for Whisper.
    Prefer explicit transcript_language (ISO code); else derive from course.language; else auto (None).
    """
    raw = getattr(course, "transcript_language", None)
    if raw:
        code = str(raw).strip().lower()
        if code in ("", "auto"):
            return None
        if len(code) >= 2:
            return code[:2]
    return _whisper_lang(course.language or "")


@celery_app.task(bind=True, max_retries=3)
def process_course_material(self, course_id: str, material_ids: list):
    """AI pipeline: transcribe/extract → moderate → structure → quizzes → index → thumbnails."""
    from app.database import SessionLocal
    from app.models.course import Course, CourseMaterial, Chapter, Lesson
    import json

    db = SessionLocal()
    course = None
    try:
        update_status(course_id, ai_status="processing", ai_progress="5", current_step="transcribe")

        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return

        course.ai_last_error = None
        course.ai_pipeline_step = "transcribe"
        course.content_validation_status = "pending"
        course.moderation_status = "pending"
        db.commit()

        lang = _resolve_transcription_language(course)
        instruct_lang = course.language or "English"
        whisper_code = lang or "auto"
        redis_client.hset(f"ai_status:{course_id}", "transcription_language", whisper_code)

        combined_content = ""
        file_names = []

        for material_id in material_ids:
            material = db.query(CourseMaterial).filter(CourseMaterial.id == material_id).first()
            if not material:
                continue
            file_names.append(material.file_name or "")
            material.processing_status = "processing"
            db.commit()

            content = ""
            if material.file_type in ["video", "audio"]:
                try:
                    payload = {"file_url": material.file_url, "material_id": str(material_id)}
                    if lang:
                        payload["language"] = lang
                    resp = httpx.post(
                        f"{AI_SERVICE_URL}/transcribe",
                        json=payload,
                        timeout=600,
                    )
                    if resp.status_code != 200:
                        material.processing_error = f"transcribe HTTP {resp.status_code}: {resp.text[:200]}"
                        print(f"Transcription HTTP error: {material.processing_error}")
                    if resp.status_code == 200:
                        data = resp.json()
                        content = data.get("text", "")
                        tl = data.get("language")
                        if tl:
                            redis_client.hset(f"ai_status:{course_id}", "detected_language", tl)
                        # Save VTT caption file from segments
                        segments = data.get("segments", [])
                        if segments:
                            vtt_content = _segments_to_vtt(segments)
                            material.extracted_text = vtt_content  # reuse field for VTT
                            redis_client.setex(
                                f"captions:{course_id}:{material_id}",
                                86400 * 30,
                                vtt_content,
                            )
                except Exception as e:
                    material.processing_error = str(e)
                    print(f"Transcription failed: {e}")
            elif material.file_type in ["pdf", "doc", "ppt"]:
                try:
                    resp = httpx.post(
                        f"{AI_SERVICE_URL}/extract-text",
                        json={"file_url": material.file_url, "file_type": material.file_type},
                        timeout=120,
                    )
                    if resp.status_code == 200:
                        content = resp.json().get("text", "")
                except Exception as e:
                    material.processing_error = str(e)
                    print(f"Text extraction failed: {e}")

            material.extracted_text = content
            material.processing_status = "completed"
            combined_content += (content or "") + "\n\n"
            db.commit()

        update_status(course_id, ai_progress="25", current_step="moderate", steps_completed="transcription")

        # Moderation
        try:
            mod = httpx.post(
                f"{AI_SERVICE_URL}/moderate-content",
                json={
                    "title": course.title,
                    "category": course.category or "",
                    "body_text": combined_content[:16000],
                    "file_names": file_names,
                },
                timeout=120,
            )
            if mod.status_code == 200:
                mr = mod.json()
                course.content_validation_details = mr
                if mr.get("allowed"):
                    course.content_validation_status = "approved"
                    course.moderation_status = "approved"
                else:
                    course.content_validation_status = "rejected"
                    course.moderation_status = "rejected"
                    course.ai_last_error = "Content moderation failed: " + ",".join(mr.get("reasons") or [])
            else:
                course.content_validation_status = "approved"
                course.moderation_status = "approved"
        except Exception as e:
            print(f"Moderation failed: {e}")
            course.content_validation_status = "approved"
            course.moderation_status = "approved"

        db.commit()

        if course.moderation_status == "rejected":
            course.ai_processing_status = "failed"
            course.ai_pipeline_step = "moderate"
            course.ai_last_error = course.ai_last_error or "Moderation rejected"
            db.commit()
            update_status(course_id, ai_status="failed", ai_progress="100", error=course.ai_last_error)
            return

        update_status(course_id, ai_progress="40", current_step="structure", steps_completed="transcription,moderate")

        # Structure (after ALL materials — fixed bug: no longer `i == 0`)
        if combined_content.strip():
            try:
                resp = httpx.post(
                    f"{AI_SERVICE_URL}/structure-course",
                    json={"content": combined_content[:8000], "language": instruct_lang},
                    timeout=180,
                )
                if resp.status_code == 200:
                    structure = resp.json()
                    if isinstance(structure, str):
                        structure = json.loads(structure)
                    save_course_structure(db, course, structure, lesson_transcript_lang=lang or _whisper_lang(course.language) or "en")
                    update_status(
                        course_id,
                        ai_progress="55",
                        steps_completed="transcription,moderate,structuring",
                    )
            except Exception as e:
                course.ai_last_error = f"structuring: {e}"
                print(f"Course structuring failed: {e}")

        db.refresh(course)

        # Quizzes per chapter
        update_status(course_id, ai_progress="65", current_step="quizzes")
        try:
            chapters = db.query(Chapter).filter(Chapter.course_id == course_id).order_by(Chapter.order_index).all()
            for chapter in chapters:
                # Per-chapter isolation: a single failed/rate-limited chapter must not abort
                # quiz generation for the remaining chapters.
                try:
                    chapter_content = " ".join([l.ai_summary or l.title for l in chapter.lessons])
                    if not chapter_content:
                        continue
                    resp = httpx.post(
                        f"{AI_SERVICE_URL}/generate-quiz",
                        json={
                            "content": chapter_content,
                            "num_questions": 5,
                            "language": instruct_lang,
                        },
                        timeout=120,
                    )
                    if resp.status_code == 200:
                        quiz_data = resp.json()
                        if isinstance(quiz_data, str):
                            quiz_data = json.loads(quiz_data)
                        save_quiz(db, course_id, chapter, quiz_data)
                except Exception as ce:
                    print(f"Quiz generation failed for chapter {chapter.id}: {ce}")
            update_status(course_id, ai_progress="75", steps_completed="transcription,moderate,structuring,quizzes")
        except Exception as e:
            print(f"Quiz generation failed: {e}")

        # Index
        if combined_content.strip():
            try:
                httpx.post(
                    f"{AI_SERVICE_URL}/index",
                    json={
                        "course_id": course_id,
                        "text": combined_content,
                        "lesson_id": str(course.id),
                        "chapter_id": str(course.id),
                        "source_type": "course_content",
                    },
                    timeout=300,
                )
                update_status(
                    course_id,
                    ai_progress="85",
                    steps_completed="transcription,moderate,structuring,quizzes,indexing",
                )
            except Exception as e:
                print(f"Indexing failed: {e}")

        # Course banner thumbnail
        update_status(course_id, ai_progress="90", current_step="thumbnail")
        # Define face_url here so per-lesson block can always reference it safely
        try:
            face_url = getattr(course.teacher, "avatar_url", None) if course.teacher else None
        except Exception:
            face_url = None
        try:
            resp = httpx.post(
                f"{AI_SERVICE_URL}/generate-thumbnail",
                json={
                    "title": course.title,
                    "category": course.category or "Education",
                    "description": course.description or "",
                    "faculty_face_image_url": face_url,
                },
                timeout=120,
            )
            if resp.status_code == 200:
                thumbnail_url = resp.json().get("thumbnail_url")
                if thumbnail_url:
                    course.thumbnail_url = thumbnail_url
                    db.commit()
        except Exception as e:
            print(f"Thumbnail generation failed: {e}")

        # Per-lesson thumbnails (first pass)
        try:
            lessons = (
                db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()
            )
            for les in lessons[:20]:
                ch = db.query(Chapter).filter(Chapter.id == les.chapter_id).first()
                r2 = httpx.post(
                    f"{AI_SERVICE_URL}/generate-thumbnail",
                    json={
                        "title": course.title,
                        "category": course.category or "Education",
                        "description": les.ai_summary or les.title,
                        "lesson_title": les.title,
                        "module_title": ch.title if ch else "",
                        "faculty_face_image_url": face_url,
                    },
                    timeout=120,
                )
                if r2.status_code == 200:
                    u = r2.json().get("thumbnail_url")
                    if u:
                        les.thumbnail_url = u
            db.commit()
        except Exception as e:
            print(f"Lesson thumbnails failed: {e}")

        course.ai_processing_status = "completed"
        course.ai_pipeline_step = "done"
        db.commit()
        update_status(course_id, ai_progress="100", ai_status="completed", steps_completed="all")

        from app.services.notification_service import create_notification
        create_notification(
            db,
            str(course.teacher_id),
            "ai_processing_complete",
            "Course Processing Complete!",
            f"Your course '{course.title}' has been processed. Please review and publish.",
            {"course_id": course_id},
        )
        from tasks.email_tasks import notify_teacher_processing_complete
        notify_teacher_processing_complete.delay(course_id)

    except Exception as e:
        update_status(course_id, ai_status="failed", error=str(e))
        course = db.query(Course).filter(Course.id == course_id).first()
        if course:
            course.ai_processing_status = "failed"
            course.ai_last_error = str(e)
            db.commit()
        raise self.retry(exc=e, countdown=60)
    finally:
        db.close()


def save_course_structure(db, course, structure: dict, lesson_transcript_lang: str = None):
    from app.models.course import Chapter, Lesson
    import json

    if isinstance(structure, str):
        structure = json.loads(structure)

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
            order_index=ch_data.get("order", 1),
        )
        db.add(chapter)
        db.flush()

        for lesson_data in ch_data.get("lessons", []):
            key_concepts = lesson_data.get("key_concepts", [])
            summary = lesson_data.get("summary") or ""
            # Embed key concepts into raw_transcript so they're searchable
            raw = summary
            if key_concepts:
                raw += "\n\nKey concepts: " + ", ".join(key_concepts)
            lesson = Lesson(
                chapter_id=chapter.id,
                course_id=course.id,
                title=lesson_data.get("title", "Lesson"),
                lesson_type="video",
                order_index=lesson_data.get("order", 1),
                ai_summary=summary or None,
                raw_transcript=raw or None,
                is_published=True,
                transcript_language=lesson_transcript_lang,
            )
            db.add(lesson)

    course.total_chapters = len(chapters_data)
    db.commit()


def save_quiz(db, course_id: str, chapter, quiz_data: dict):
    from app.models.quiz import Quiz, QuizQuestion
    import json

    if isinstance(quiz_data, str):
        quiz_data = json.loads(quiz_data)

    questions_data = quiz_data.get("questions", [])
    if not questions_data:
        return

    quiz = Quiz(
        course_id=course_id,
        chapter_id=chapter.id,
        title=f"Quiz: {chapter.title}",
        max_attempts=3,
        pass_percent=60,
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
            ai_generated=True,
        )
        db.add(question)

    db.commit()


@celery_app.task
def retry_ai_pipeline_step(course_id: str, step: str, material_ids: list = None):
    """Re-run full pipeline (simplified) or specific step — reuse process_course_material."""
    mids = material_ids or []
    if not mids:
        from app.database import SessionLocal
        from app.models.course import CourseMaterial

        db = SessionLocal()
        try:
            mats = db.query(CourseMaterial).filter(CourseMaterial.course_id == course_id).all()
            mids = [str(m.id) for m in mats]
        finally:
            db.close()
    process_course_material.delay(course_id, mids)
