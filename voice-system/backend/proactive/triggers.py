import asyncio
import time
from typing import List, Callable, Any
from core.logger import logger
from proactive.goals import goal_tracker

class TriggerEngine:
    def __init__(self):
        self.triggers: List[Dict[str, Any]] = []

    def add_time_trigger(self, target_time: float, callback: Callable, context: Any = None):
        self.triggers.append({
            "type": "time",
            "target": target_time,
            "callback": callback,
            "context": context
        })

    async def check_triggers(self):
        """Continuously check for active triggers."""
        now = time.time()
        to_remove = []
        
        for i, t in enumerate(self.triggers):
            if t["type"] == "time" and now >= t["target"]:
                logger.info(f"⚡ Time Trigger Fired!")
                await t["callback"](t["context"])
                to_remove.append(i)
        
        # Cleanup processed triggers
        for i in reversed(to_remove):
            self.triggers.pop(i)

# Global instance
trigger_engine = TriggerEngine()

async def start_trigger_loop():
    while True:
        await trigger_engine.check_triggers()
        await asyncio.sleep(10) # Check every 10 seconds
