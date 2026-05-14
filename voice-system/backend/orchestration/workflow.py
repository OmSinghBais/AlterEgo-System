import asyncio
from typing import List, Dict, Any
from agents.planner import PlannerAgent
from agents.researcher import ResearcherAgent
from utils.logger import logger

class Orchestrator:
    def __init__(self):
        self.planner = PlannerAgent()
        self.researcher = ResearcherAgent()

    async def execute_task(self, goal: str):
        """Main autonomous loop."""
        logger.info(f"🎯 Starting autonomous task: {goal}")
        
        # 1. Plan
        steps = await self.planner.plan(goal)
        if not steps:
            return "Failed to generate a plan."

        results = []
        for step in steps:
            logger.info(f"⏭️ Step: {step['step_name']}")
            
            # 2. Delegate
            tool_name = step.get("tool")
            if tool_name in ["browser_search", "browser_scrape"]:
                result = await self.researcher.act(step)
            else:
                result = await self.planner.act(step)
            
            results.append(result)
            
            # 3. Intermediate Reflection (Optional)
            # If step fails, we could re-plan here

        # 4. Final Synthesis
        final_report = await self.planner.reflect(goal, results)
        logger.info("✅ Task completed.")
        return final_report

orchestrator = Orchestrator()
