import redis
from rq import Queue
from core.settings import get_settings
from core.logger import logger

settings = get_settings()

try:
    redis_conn = redis.from_url(settings.REDIS_URL)
    main_queue = Queue("alterego", connection=redis_conn)
    logger.info(f"Successfully connected to Redis at {settings.REDIS_URL}")
except Exception as e:
    logger.error(f"Failed to connect to Redis: {e}")
    redis_conn = None
    main_queue = None

def enqueue_job(func, *args, **kwargs):
    """Safely enqueue a background job."""
    if main_queue:
        job = main_queue.enqueue(func, *args, **kwargs)
        logger.info(f"Job enqueued: {func.__name__} [ID: {job.get_id()}]")
        return job
    else:
        logger.warning(f"Queue not available. Running {func.__name__} synchronously.")
        return func(*args, **kwargs)
