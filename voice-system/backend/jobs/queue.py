import redis
from rq import Queue
from config.settings import get_settings
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

async def enqueue_job(func, *args, **kwargs):
    """Safely enqueue a background job."""
    if main_queue:
        # Note: RQ doesn't natively support async functions. 
        # For now we enqueue them, but they may fail in the worker if not wrapped.
        job = main_queue.enqueue(func, *args, **kwargs)
        logger.info(f"Job enqueued: {func.__name__} [ID: {job.get_id()}]")
        return job
    else:
        logger.warning(f"Queue not available. Running {func.__name__} in fallback mode.")
        import inspect
        if inspect.iscoroutinefunction(func):
            return await func(*args, **kwargs)
        else:
            return func(*args, **kwargs)
