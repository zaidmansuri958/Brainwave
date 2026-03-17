from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from embeddings import embed_text
import os
import uuid

QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

qdrant = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


async def index_course_material(
    course_id: str,
    text: str,
    lesson_id: str,
    chapter_id: str,
    source_type: str
):
    """Index course material into Qdrant for RAG chatbot."""
    collection_name = f"course_{course_id}"

    # Create collection if not exists
    try:
        collections = [c.name for c in qdrant.get_collections().collections]
        if collection_name not in collections:
            qdrant.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE)
            )
    except Exception as e:
        print(f"Collection creation error: {e}")
        return

    # Chunk the content
    chunks = chunk_text(text)
    if not chunks:
        return

    # Embed and index
    points = []
    for i, chunk in enumerate(chunks):
        try:
            embedding = await embed_text(chunk)
            if embedding:
                points.append(PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "text": chunk,
                        "source_type": source_type,
                        "lesson_id": lesson_id,
                        "chapter_id": chapter_id,
                        "chunk_index": i
                    }
                ))
        except Exception as e:
            print(f"Embedding chunk {i} failed: {e}")

    if points:
        try:
            qdrant.upsert(collection_name=collection_name, points=points)
            print(f"Indexed {len(points)} chunks for course {course_id}")
        except Exception as e:
            print(f"Qdrant upsert failed: {e}")


def delete_course_collection(course_id: str):
    """Delete all vectors for a course."""
    collection_name = f"course_{course_id}"
    try:
        qdrant.delete_collection(collection_name)
    except Exception:
        pass
