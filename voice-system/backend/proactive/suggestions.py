import json
from typing import List
from core.settings import get_settings
from core.logger import logger
from proactive.goals import goal_tracker
from memory.retrieval import assemble_context

settings = get_settings()

async def generate_proactive_suggestions() -> List[str]:
    """
    Analyzes current context, goals, and graph to generate 
    subtle, helpful suggestions for the user.
    """
    from llm import get_client
    client = get_client()
    
    # Assemble wide context
    goals = goal_tracker.get_active_goals()
    context = assemble_context("proactive analysis")
    
    prompt = f"""
    You are AlterEGO's Proactive Intelligence Layer.
    Based on the user's goals and recent context, suggest 2-3 SHORT, subtle, and highly relevant actions or insights.
    Avoid being intrusive. Be like an elite assistant.
    
    Goals: {json.dumps(goals)}
    Context: {context}
    
    Return a JSON list of strings.
    Example: ["You mentioned wanting to learn Redis; I found a great visual guide.", "Module 6 is 80% complete. Ready to plan Phase 7?"]
    """
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": "You are a proactive AI strategist."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content or "{}")
        return data.get("suggestions", [])
    except Exception as e:
        logger.error(f"Suggestion generation failed: {e}")
        return []
