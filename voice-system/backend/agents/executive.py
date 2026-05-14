from typing import List, Dict, Any
from agents.base_agent import BaseAgent
from agents.planner import PlannerAgent
from agents.researcher import ResearcherAgent
from orchestration.workflow import Orchestrator
from config.settings import get_settings
from utils.logger import logger

settings = get_settings()

class ExecutiveAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Executive", role="Lead Cognitive Coordinator")
        self.orchestrator = Orchestrator()
        self.planner = PlannerAgent()

    async def handle_request(self, user_text: str):
        """Entry point for all high-level requests."""
        # 1. Determine if this is a short-term command or a long-term goal
        is_complex = await self.is_complex_request(user_text)
        
        if is_complex:
            logger.info("🧠 Executive Agent: Processing complex cognitive task.")
            return await self.orchestrator.execute_task(user_text)
        else:
            # Simple pass-through or quick tool call
            return await self.planner.act({"tool": "quick_response", "args": {"input": user_text}})

    async def is_complex_request(self, text: str) -> bool:
        """Use a lightweight local model (if available) to classify the request."""
        from llm import get_client, get_model
        client = get_client()
        
        # If using Ollama, this is very fast
        prompt = f"Is this a complex multi-step request? Answer ONLY with 'yes' or 'no'. Text: '{text}'"
        
        try:
            response = await client.chat.completions.create(
                model=get_model(),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=5
            )
            ans = response.choices[0].message.content.strip().lower()
            return "yes" in ans
        except:
            return True

    async def reflect_on_goals(self):
        """Periodic review of long-term goals and progress."""
        logger.info("🔭 Executive Agent: Reflecting on long-term objectives...")
        # TODO: Fetch active goals from DB and update progress
        pass

executive_agent = ExecutiveAgent()
