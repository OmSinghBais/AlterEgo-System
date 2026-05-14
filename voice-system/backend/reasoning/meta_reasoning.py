from typing import List, Dict, Any
from core.logger import logger

class MetaReasoning:
    def __init__(self):
        pass

    async def criticize_plan(self, goal: str, plan: List[Dict[str, Any]]) -> Tuple[bool, str]:
        """
        Evaluate a plan before execution.
        Returns (is_valid, critique).
        """
        from llm import get_client, get_model
        client = get_client()
        
        prompt = f"""
        Goal: {goal}
        Proposed Plan: {plan}
        
        Analyze this plan for:
        1. Logical flow.
        2. Missing steps.
        3. Potential for failure.
        
        If the plan is good, respond with 'VALID'. 
        If not, provide a critique.
        """
        
        try:
            response = await client.chat.completions.create(
                model=get_model(),
                messages=[{"role": "system", "content": "You are a critical reasoning verifier."},
                          {"role": "user", "content": prompt}]
            )
            ans = response.choices[0].message.content.strip()
            if "VALID" in ans.upper():
                return True, ""
            return False, ans
        except:
            return True, ""

    async def verify_result(self, step: Dict[str, Any], result: Any) -> bool:
        """Verify if a tool result successfully completed the step."""
        # Simple heuristic or LLM check
        if not result or "error" in str(result).lower():
            return False
        return True

reasoning_engine = MetaReasoning()
