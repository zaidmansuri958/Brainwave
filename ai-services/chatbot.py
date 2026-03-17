from qdrant_client import QdrantClient
from embeddings import embed_text
import httpx
import os

QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")

qdrant = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

RAG_PROMPT = """You are an AI teaching assistant for the course: "{course_name}".
Answer the student's question using ONLY the provided course materials below.
If the answer is not in the materials, say: "This topic isn't covered in the course material. Please ask in the community group."

Course Materials:
{context}

Student Question: {question}

Answer clearly and helpfully:"""


async def chat(course_id: str, course_name: str, question: str) -> dict:
    """RAG chatbot: retrieve relevant context and generate answer."""
    collection_name = f"course_{course_id}"

    # Check if collection exists
    try:
        collections = [c.name for c in qdrant.get_collections().collections]
        if collection_name not in collections:
            return {
                "response": "This course doesn't have any indexed material yet. Please ask in the community group.",
                "sources": []
            }
    except Exception:
        return {
            "response": "Course material not yet available. Please ask in the community group.",
            "sources": []
        }

    # 1. Embed the question
    try:
        question_embedding = await embed_text(question)
    except Exception:
        return {
            "response": "I'm having trouble processing your question. Please try again.",
            "sources": []
        }

    # 2. Search Qdrant
    try:
        search_results = qdrant.search(
            collection_name=collection_name,
            query_vector=question_embedding,
            limit=5,
            score_threshold=0.4
        )
    except Exception:
        search_results = []

    if not search_results:
        return {
            "response": "This topic isn't covered in the course material. Please ask in the community group.",
            "sources": []
        }

    # 3. Build context
    context = "\n\n".join([r.payload.get("text", "") for r in search_results])
    sources = [
        {
            "chunk_text": r.payload.get("text", "")[:200],
            "lesson_id": r.payload.get("lesson_id"),
            "source_type": r.payload.get("source_type"),
            "score": r.score
        }
        for r in search_results
    ]

    # 4. Generate answer with Llama 3
    prompt = RAG_PROMPT.format(
        course_name=course_name,
        context=context[:4000],
        question=question
    )

    try:
        async with httpx.AsyncClient(timeout=90) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "llama3:8b",
                    "prompt": prompt,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                response = resp.json().get("response", "")
                return {"response": response, "sources": sources}
    except Exception as e:
        print(f"LLM generation error: {e}")

    return {
        "response": "I'm having difficulty generating a response right now. Please try again.",
        "sources": sources
    }
