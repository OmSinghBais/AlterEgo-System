import time
from tools.registry import registry, PERMISSION_AUTO
from utils.logger import logger

@registry.register(
    name="schedule_reminder",
    description="Schedule a reminder for the user at a future date/time.",
    parameters={
        "type": "object",
        "properties": {
            "text": {"type": "string", "description": "The reminder content."},
            "delay_seconds": {"type": "integer", "description": "Seconds from now to trigger."}
        },
        "required": ["text", "delay_seconds"]
    },
    permission=PERMISSION_AUTO,
    tags=["system"]
)
async def schedule_reminder(text: str, delay_seconds: int) -> str:
    target_time = time.time() + delay_seconds
    logger.info(f"⏰ Reminder scheduled: '{text}' at {time.ctime(target_time)}")
    # In a real app, this would be stored in the 'goals' or 'tasks' table
    return f"Reminder set: {text}"
