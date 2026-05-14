import json
from typing import List, Dict
from config.settings import get_settings
from core.logger import logger
from memory import set_fact, consolidate_to_long_term, get_all_facts

settings = get_settings()

async def extract_and_store_facts(content: str):
    """
    Uses LLM to extract structured facts from a conversation message.
    Example: "I prefer dark mode" -> UserFact(key="theme_preference", value="dark")
    """
    from llm import get_client, get_model
    client = get_client()
    model = get_model()
    
    existing_facts = get_all_facts()
    
    prompt = f"""
    Analyze the following user message and extract any permanent facts, preferences, or personal details about the user.
    Return the result as a JSON list of objects with 'key' and 'value'.
    If no new facts are found, return an empty list [].
    
    Current known facts for context: {json.dumps(existing_facts)}
    
    User Message: "{content}"
    
    JSON Output:
    """
    
    # 🛠️ Compatibility: Disable strict JSON format for Ollama
    use_json_format = "localhost:11434" not in str(client.base_url)
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a memory extraction engine for a personal AI. You extract atomic, permanent facts about users. Return result as JSON with 'facts' list."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} if use_json_format else None
        )
        
        data = json.loads(response.choices[0].message.content)
        facts = data.get("facts", [])
        
        for fact in facts:
            key = fact.get("key")
            value = fact.get("value")
            if key and value:
                logger.info(f"🧠 New fact learned: {key} = {value}")
                set_fact(key, value)
                
    except Exception as e:
        logger.error(f"Fact extraction failed: {e}")

async def run_consolidation_cycle(messages: List[Dict[str, str]]):
    """
    Performs a deep consolidation of a recent conversation segment.
    1. Extracts new facts.
    2. Generates a long-term episodic memory.
    """
    if not messages:
        return

    full_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    
    # 1. High-level fact extraction
    await extract_and_store_facts(full_text)
    
    # 2. Episodic summarization
    from memory import summarize_history
    summary = await summarize_history(messages)
    
    if summary:
        logger.info("🎬 Episodic memory consolidated.")
        consolidate_to_long_term(summary, importance=0.7, category="episode")
