import redis
import json
from rq import Worker, Queue, Connection
from core.settings import get_settings
from core.logger import logger

settings = get_settings()

def publish_telemetry(data: dict):
    """Publish agent thoughts to Redis for real-time UI updates."""
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.publish("agent_telemetry", json.dumps(data))
    except Exception as e:
        logger.error(f"Failed to publish telemetry: {e}")

def start_worker():
    """Start the RQ worker process."""
    try:
        conn = redis.from_url(settings.REDIS_URL)
        with Connection(conn):
            worker = Worker(["alterego"])
            logger.info("Worker starting. Listening on queue: 'alterego'")
            worker.work()
    except Exception as e:
        logger.error(f"Worker failed to start: {e}")

if __name__ == "__main__":
    start_worker()
