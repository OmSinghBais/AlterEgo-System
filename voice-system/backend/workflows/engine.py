import asyncio
from typing import List, Dict, Any, Optional
from core.logger import logger
from agents.planner import PlannerAgent
from jobs.worker import publish_telemetry

class WorkflowEngine:
    def __init__(self):
        self.planner = PlannerAgent()
        self.active_tasks: Dict[str, Any] = {}

    async def execute_goal(self, goal: str) -> str:
        """
        The main autonomous loop:
        1. Think about the goal
        2. Create a plan (steps)
        3. Execute steps one-by-one
        4. Reflect and return final response
        """
        logger.info(f"🎯 Starting Workflow for Goal: {goal}")
        
        # 1. Think
        await self.planner.think(goal)
        
        # 2. Plan
        steps = await self.planner.plan(goal)
        if not steps:
            return "I couldn't formulate a plan for that goal."

        results = []
        
        # 3. Act (Sequential Execution)
        for i, step in enumerate(steps):
            name = step.get('step_name')
            logger.info(f"🔄 Step {i+1}/{len(steps)}: {name}")
            publish_telemetry({
                "type": "agent_action",
                "step": name,
                "tool": step.get("tool"),
                "index": i + 1,
                "total": len(steps)
            })
            
            try:
                result = await self.planner.act(step)
                results.append({
                    "step": name,
                    "status": "success",
                    "output": result
                })
            except Exception as e:
                logger.error(f"❌ Step failed: {e}")
                results.append({
                    "step": step.get("step_name"),
                    "status": "failed",
                    "error": str(e)
                })
                # Optional: Add retry logic or branching here

        # 4. Reflect
        logger.info("✨ Execution complete. Reflecting on results...")
        final_report = await self.planner.reflect(goal, results)
        
        return final_report

async def run_autonomous_task(goal: str):
    """Entry point for background jobs."""
    engine = WorkflowEngine()
    return await engine.execute_goal(goal)
