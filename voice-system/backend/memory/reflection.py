import asyncio
import time
from typing import List
from memory.knowledge_graph import kg
from memory.entity_extractor import extract_entities
from core.logger import logger
from db.database import SessionLocal
from db.models import Conversation

async def reflect_on_recent_conversations(limit: int = 20):
    """
    Background process to analyze recent chat history, 
    extract new entities, and update the knowledge graph.
    """
    logger.info("🧠 Memory Reflection Cycle Started...")
    
    db = SessionLocal()
    try:
        # Get recent messages that haven't been processed into graph yet (simple timestamp filter for now)
        msgs = db.query(Conversation).order_by(Conversation.id.desc()).limit(limit).all()
        
        for msg in reversed(msgs):
            if msg.role == "user":
                # 1. Extract entities
                entities = await extract_entities(msg.content)
                
                # 2. Update Graph
                for cat, names in entities.items():
                    for name in names:
                        kg.add_entity(name, cat)
                        
                # 3. Simple relationship guessing (heuristic)
                # If a project and a technology are mentioned in the same message, link them
                projs = entities.get("projects", [])
                techs = entities.get("technologies", [])
                for p in projs:
                    for t in techs:
                        kg.add_relationship(p, t, "USES")
                        kg.add_relationship("Om", p, "WORKS_ON")
        
        # 4. Save the evolved graph
        kg.save()
        logger.info("✨ Memory Reflection Cycle Complete.")
        
    except Exception as e:
        logger.error(f"Reflection failed: {e}")
    finally:
        db.close()

def start_reflection_loop():
    """Triggered periodically or manually."""
    from jobs.queue import enqueue_job
    enqueue_job(reflect_on_recent_conversations)
