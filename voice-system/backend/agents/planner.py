import json
from typing import List, Dict, Any
from agents.base_agent import BaseAgent
from core.settings import get_settings
from core.logger import logger
from tools.registry import registry

settings = get_settings()

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Planner", role="Strategic Coordinator")

    async def think(self, goal: str) -> str:
        """Analyze the goal and determine if it's simple or complex."""
        from llm import get_client
        client = get_client()
        
        prompt = f"Analyze this goal: '{goal}'. Determine if it requires a multi-step plan or a single tool call. Explain your reasoning."
        
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": "You are a strategic reasoning engine."},
                      {"role": "user", "content": prompt}]
        )
        thought = response.choices[0].message.content or ""
        self.log_thought(thought)
        return thought

    async def plan(self, goal: str) -> List[Dict[str, Any]]:
        """Decompose the goal into a sequence of tool-driven steps."""
        from llm import get_client
        client = get_client()
        
        tools_available = registry.to_openai_tools()
        tools_desc = "\n".join([f"- {t['function']['name']}: {t['function']['description']}" for t in tools_available])
        
        prompt = f"""
        Goal: {goal}
        
        Available Tools:
        {tools_desc}
        
        Create a precise JSON list of steps to achieve this goal. 
        Each step must have: 'step_name', 'tool', and 'args'.
        Example format:
        [
          {{"step_name": "Search for news", "tool": "duckduckgo_search", "args": {{"query": "AI news"}}}},
          {{"step_name": "Summarize", "tool": "write_note", "args": {{"title": "AI Summary", "content": "..."}}}}
        ]
        """
        
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": "You are an expert task planner. Output ONLY valid JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        try:
            plan_data = json.loads(response.choices[0].message.content or "[]")
            # Handle if the model wraps it in a 'steps' key
            steps = plan_data.get("steps", plan_data) if isinstance(plan_data, dict) else plan_data
            logger.info(f"Generated plan with {len(steps)} steps.")
            return steps
        except Exception as e:
            logger.error(f"Failed to parse plan: {e}")
            return []

    async def act(self, step: Dict[str, Any]) -> Any:
        """Execute a single step from the plan."""
        from tools.executor import execute_tool
        
        name = step.get("step_name", "Unknown Step")
        tool = step.get("tool")
        args = step.get("args", {})
        
        logger.info(f"🚀 Executing Step: {name} (using {tool})")
        result = await execute_tool(tool, args)
        return result

    async def reflect(self, goal: str, results: List[Any]) -> str:
        """Review all results and summarize the achievement."""
        from llm import get_client
        client = get_client()
        
        results_str = "\n".join([f"Result: {r}" for r in results])
        prompt = f"Goal: {goal}\n\nExecution Results:\n{results_str}\n\nSynthesize these results into a final report for the user."
        
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": "You are a professional report synthesizer."},
                      {"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content or ""
