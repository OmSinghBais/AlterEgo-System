import json
import time
from typing import List, Dict, Any
from db.database import SessionLocal
from db.models import Conversation, Habit, SuccessfulWorkflow, LongTermMemory
from core.logger import logger

def get_db():
    return SessionLocal()

async def submit_feedback(message_id: int, score: int):
    """
    Submit user feedback for a specific message.
    Score: 1 for thumbs up, -1 for thumbs down.
    """
    db = get_db()
    try:
        msg = db.query(Conversation).filter(Conversation.id == message_id).first()
        if msg:
            msg.feedback = score
            db.commit()
            logger.info(f"✨ Feedback received for message {message_id}: {score}")
            
            # If negative feedback, trigger self-correction analysis
            if score < 0:
                await analyze_failure(msg.content)
    finally:
        db.close()

async def analyze_failure(content: str):
    """Analyze why a response was poorly rated and learn from it."""
    logger.info(f"🔍 Analyzing failure: {content[:50]}...")
    # TODO: Use LLM to identify mistake and store a 'CorrectionFact'

def record_workflow_success(goal: str, plan: List[Dict[str, Any]]):
    """Store a successful plan to reuse it later."""
    db = get_db()
    try:
        workflow = db.query(SuccessfulWorkflow).filter(SuccessfulWorkflow.goal == goal).first()
        if workflow:
            workflow.success_count += 1
        else:
            workflow = SuccessfulWorkflow(
                goal=goal,
                plan_json=json.dumps(plan)
            )
            db.add(workflow)
        db.commit()
        logger.info(f"🏆 Workflow optimized for goal: {goal}")
    finally:
        db.close()

def detect_habits():
    """Analyze conversation history to detect recurring patterns."""
    db = get_db()
    try:
        # Simple heuristic: find common phrases or times
        # This would be more advanced in a real deployment
        pass
    finally:
        db.close()

async def update_memory_importance(query: str):
    """Boost importance of memories that are frequently accessed."""
    from utils.embeddings import get_embedding, cosine_similarity
    query_vec = get_embedding(query)
    if not query_vec: return

    db = get_db()
    try:
        mems = db.query(LongTermMemory).all()
        for m in mems:
            if not m.embedding: continue
            m_vec = json.loads(m.embedding)
            score = cosine_similarity(query_vec, m_vec)
            if score > 0.85:
                m.access_count += 1
                m.last_accessed = time.time()
                # Boost importance slightly on each access
                m.importance = min(1.0, m.importance + 0.05)
        db.commit()
    finally:
        db.close()
