import os
import time
import asyncio
from redis import Redis
from rq import Worker, Queue, Connection
from config.settings import get_settings
from core.logger import logger

settings = get_settings()
redis_conn = Redis.from_url(settings.REDIS_URL)

def start_worker():
    """Start the RQ worker to process background jobs."""
    with Connection(redis_conn):
        worker = Worker(["alterego"])
        logger.info("👷 Worker active — listening on 'alterego' queue.")
        worker.work()

async def background_reflection_loop():
    """
    Independent loop for continuous memory reflection.
    Runs every 5 minutes to consolidate recent interactions.
    """
    from memory.consolidation import run_consolidation_cycle
    from memory import get_context_messages
    
    logger.info("🧠 Continuous Memory Orchestrator started.")
    
    while True:
        try:
            # 1. Fetch recent messages that haven't been consolidated
            # (In a real system, we'd track 'last_consolidated_id')
            recent = get_context_messages(max_messages=50)
            
            if len(recent) > 5:
                logger.info(f"🔄 Consolidating {len(recent)} messages...")
                await run_consolidation_cycle(recent)
            
            # 2. Wait for next cycle
            await asyncio.sleep(300) # 5 minutes
            
        except Exception as e:
            logger.error(f"Reflection loop error: {e}")
            await asyncio.sleep(60)

if __name__ == "__main__":
    # If run directly, start the worker
    start_worker()
