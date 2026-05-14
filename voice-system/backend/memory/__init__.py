import json
import time
from typing import Any, List, Dict
from sqlalchemy.orm import Session
from db.database import SessionLocal, engine, Base
from db.models import Conversation, LongTermMemory, UserFact, SystemEvent
from config.settings import get_settings
from core.logger import logger
from jobs.queue import enqueue_job
from utils.embeddings import get_embedding, cosine_similarity

settings = get_settings()

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    return SessionLocal()

# ── Conversation History ──────────────────────────────────────────────

async def append_message(role: str, content: str, importance: float = 0.5):
    db = get_db()
    try:
        msg = Conversation(role=role, content=content, timestamp=time.time(), importance=importance)
        db.add(msg)
        db.commit()
        
        # 🧠 Intelligence: If importance is high, run deep consolidation
        if importance > 0.7:
            from memory.consolidation import extract_and_store_facts
            # Run extraction in the background (using job queue if available, or simple thread)
            await enqueue_job(extract_and_store_facts, content)
            
    finally:
        db.close()

def get_context_messages(max_messages: int = 20) -> List[Dict[str, str]]:
    db = get_db()
    try:
        msgs = db.query(Conversation).order_by(Conversation.id.desc()).limit(max_messages).all()
        return [{"role": m.role, "content": m.content} for m in reversed(msgs)]
    finally:
        db.close()

def clear_history():
    db = get_db()
    try:
        db.query(Conversation).delete()
        db.commit()
    finally:
        db.close()

# ── Long Term Memory & RAG ────────────────────────────────────────────

def consolidate_to_long_term(content: str, importance: float = 0.5, category: str = "general"):
    """Move a high-importance insight into long-term vector memory."""
    db = get_db()
    try:
        embedding = get_embedding(content)
        mem = LongTermMemory(
            content=content,
            category=category,
            importance=importance,
            created_at=time.time(),
            embedding=json.dumps(embedding) if embedding else None
        )
        db.add(mem)
        db.commit()
        logger.info(f"Memory consolidated: {content[:50]}...")
    finally:
        db.close()

def search_memory(query: str, limit: int = 5) -> List[str]:
    """Semantic search over long-term memory."""
    query_vec = get_embedding(query)
    if not query_vec:
        return []
    
    db = get_db()
    try:
        mems = db.query(LongTermMemory).all()
        scored = []
        for m in mems:
            if not m.embedding: continue
            m_vec = json.loads(m.embedding)
            score = cosine_similarity(query_vec, m_vec)
            scored.append((score, m.content))
        
        # Sort by similarity
        scored.sort(key=lambda x: x[0], reverse=True)
        return [content for score, content in scored[:limit] if score > 0.6]
    finally:
        db.close()

# ── User Facts ────────────────────────────────────────────────────────

def set_fact(key: str, value: Any):
    db = get_db()
    try:
        v = json.dumps(value) if not isinstance(value, str) else value
        fact = db.query(UserFact).filter(UserFact.key == key).first()
        if fact:
            fact.value = v
            fact.updated_at = time.time()
        else:
            fact = UserFact(key=key, value=v, updated_at=time.time())
            db.add(fact)
        db.commit()
    finally:
        db.close()

def get_all_facts() -> Dict[str, Any]:
    db = get_db()
    try:
        rows = db.query(UserFact).all()
        result = {}
        for r in rows:
            try:
                result[r.key] = json.loads(r.value)
            except:
                result[r.key] = r.value
        return result
    finally:
        db.close()

# ── Importance Scoring ───────────────────────────────────────────────

def score_importance(content: str) -> float:
    score = 0.5
    word_count = len(content.split())
    if word_count > 30: score += 0.1
    if word_count < 5: score -= 0.1
    if "?" in content: score += 0.1
    preference_words = ["remember", "always", "never", "prefer", "i like", "i hate", "my name is", "i am"]
    if any(w in content.lower() for w in preference_words):
        score += 0.3
    return max(0.0, min(1.0, score))

# ── System Events ────────────────────────────────────────────────────

def log_system_event(event_type: str, data: dict = None):
    db = get_db()
    try:
        event = SystemEvent(event_type=event_type, data=json.dumps(data) if data else None, timestamp=time.time())
        db.add(event)
        db.commit()
    finally:
        db.close()

# ── Context Compression & Summarization ──────────────────────────────

async def summarize_history(messages: List[Dict[str, str]]) -> str:
    """Generate a concise summary of the conversation context."""
    from llm import get_client, get_model
    client = get_client()
    model = get_model()
    
    text_to_summarize = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    prompt = f"Summarize the following conversation context in 2-3 sentences, focusing on key facts and user preferences:\n\n{text_to_summarize}"
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": "You are a memory consolidation engine."},
                      {"role": "user", "content": prompt}],
            max_tokens=150
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        return ""

def get_memory_context(query: str = None) -> str:
    """Combine hard facts and semantic memory insights."""
    facts = get_all_facts()
    lines = []
    
    if facts:
        lines.append("Known about user:")
        for k, v in list(facts.items())[:10]:
            lines.append(f"- {k}: {v}")
            
    if query:
        semantic = search_memory(query, limit=3)
        if semantic:
            lines.append("\nRelevant past insights:")
            for s in semantic:
                lines.append(f"- {s}")
                
    return "\n".join(lines)
