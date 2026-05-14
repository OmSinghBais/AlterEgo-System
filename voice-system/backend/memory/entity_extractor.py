import json
from typing import Dict, List, Any
from core.settings import get_settings
from core.logger import logger

settings = get_settings()

async def extract_entities(text: str) -> Dict[str, List[str]]:
    """
    Analyze text and extract structured entities (projects, tools, people, etc).
    """
    from llm import get_client
    client = get_client()
    
    prompt = f"""
    Analyze the following conversation snippet and extract key entities.
    Categories: projects, technologies, people, goals, preferences.
    
    Text: "{text}"
    
    Return ONLY a JSON object.
    Example: {{"projects": ["AlterEGO"], "technologies": ["Redis"], "people": ["Om"], "goals": ["Complete Phase 6"]}}
    """
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "system", "content": "You are a precise entity extraction engine. Output valid JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content or "{}")
        return data
    except Exception as e:
        logger.error(f"Entity extraction failed: {e}")
        return {}
