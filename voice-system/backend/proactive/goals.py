import json
from pathlib import Path
from typing import List, Dict, Any
from core.logger import logger
import time

GOALS_FILE = Path(__file__).resolve().parent.parent / "data" / "goals.json"
GOALS_FILE.parent.mkdir(parents=True, exist_ok=True)

class GoalTracker:
    def __init__(self):
        self.goals = self.load()

    def add_goal(self, title: str, priority: str = "medium", deadline: str = None):
        goal = {
            "id": int(time.time()),
            "title": title,
            "priority": priority,
            "deadline": deadline,
            "status": "in_progress",
            "progress": 0.0,
            "created_at": time.time(),
            "last_updated": time.time()
        }
        self.goals.append(goal)
        self.save()
        logger.info(f"🎯 New Goal Added: {title}")

    def update_progress(self, goal_id: int, progress: float):
        for g in self.goals:
            if g["id"] == goal_id:
                g["progress"] = progress
                g["last_updated"] = time.time()
                self.save()
                break

    def get_active_goals(self) -> List[Dict[str, Any]]:
        return [g for g in self.goals if g["status"] == "in_progress"]

    def save(self):
        with open(GOALS_FILE, "w") as f:
            json.dump(self.goals, f, indent=2)

    def load(self) -> List[Dict[str, Any]]:
        if GOALS_FILE.exists():
            return json.load(open(GOALS_FILE))
        return []

# Global instance
goal_tracker = GoalTracker()
