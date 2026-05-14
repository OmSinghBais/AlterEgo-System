import json
from typing import Dict, List, Any
from config.settings import get_settings
from core.logger import logger

settings = get_settings()

async def extract_entities(text: str) -> Dict[str, List[str]]:
    """
    Analyze text and extract structured entities (projects, tools, people, etc).
    """
    from llm import get_client, get_model
    client = get_client()
    model = get_model()
    
    prompt = f"""
    Analyze the following conversation snippet and extract key entities.
    Categories: projects, technologies, people, goals, preferences.
    
    Text: "{text}"
    
    Return ONLY a JSON object.
    Example: {{"projects": ["AlterEGO"], "technologies": ["Redis"], "people": ["Om"], "goals": ["Complete Phase 6"]}}
    """
    
    # 🛠️ Compatibility: Disable strict JSON format for Ollama
    use_json_format = "localhost:11434" not in str(client.base_url)
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": "You are a precise entity extraction engine. Output valid JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"} if use_json_format else None
        )
        
        data = json.loads(response.choices[0].message.content or "{}")
        return data
    except Exception as e:
        logger.error(f"Entity extraction failed: {e}")
        return {}
