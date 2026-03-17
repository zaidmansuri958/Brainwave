import httpx
import os
from typing import List

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
EMBED_URL = f"{OLLAMA_URL}/api/embeddings"


async def embed_text(text: str) -> List[float]:
    """Returns 768-dimensional embedding vector."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            EMBED_URL,
            json={"model": "nomic-embed-text", "prompt": text[:2000]}
        )
        if resp.status_code == 200:
            return resp.json().get("embedding", [])
        raise Exception(f"Embedding failed: {resp.text}")


async def embed_batch(texts: List[str]) -> List[List[float]]:
    """Embed multiple texts."""
    embeddings = []
    for text in texts:
        try:
            emb = await embed_text(text)
            embeddings.append(emb)
        except Exception as e:
            print(f"Embedding failed for text: {e}")
            embeddings.append([0.0] * 768)
    return embeddings
