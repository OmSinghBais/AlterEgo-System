import os
import json
import time
import asyncio
from typing import AsyncGenerator, List, Dict, Any

from core.settings import get_settings
from core.logger import logger, log_latency, log_token_usage
from personality import get_mode, DEFAULT_MODE
from memory import get_context_messages, append_message, score_importance, summarize_history
from memory.retrieval import assemble_context
from memory.entity_extractor import extract_entities
from memory.reflection import start_reflection_loop
from tools.registry import registry
from tools.executor import execute_tool

settings = get_settings()

_client = None

def get_client():
    global _client
    if _client is None:
        from openai import AsyncOpenAI
        _client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None
        )
    return _client

async def stream_response(user_text: str, mode_name: str = "cinematic") -> AsyncGenerator[str, None]:
    """
    Main LLM entrance. Handles:
    1. RAG (Semantic Memory Retrieval)
    2. Tool Selection
    3. Tool Execution Loop
    4. Response Streaming & Token Tracking
    """
    t0 = time.perf_counter()
    client = get_client()
    mode = get_mode(mode_name)
    
    # 1. Advanced Context Assembly (RAG + Graph + Facts)
    # Extract entities from the current query to pull the right graph nodes
    entities = await extract_entities(user_text)
    active_names = []
    for names in entities.values():
        active_names.extend(names)
    
    memory_ctx = assemble_context(user_text, active_entities=active_names)

    # 2. Prepare Messages
    system_prompt = mode.system_prompt
    if memory_ctx:
        system_prompt += f"\n\n[AUGMENTED CONTEXT]\n{memory_ctx}"
    
    messages = [{"role": "system", "content": system_prompt}]
    
    history = get_context_messages(max_messages=20)
    if len(history) > 15:
        summary = await summarize_history(history[:-5])
        messages.append({"role": "system", "content": f"[CONVERSATION SUMMARY]\n{summary}"})
        messages.extend(history[-5:])
    else:
        messages.extend(history)
        
    messages.append({"role": "user", "content": user_text})

    # 3. Get Tools
    available_tools = registry.to_openai_tools()

    # 4. First LLM Pass
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            tools=available_tools if available_tools else None,
            tool_choice="auto" if available_tools else None,
            stream=True,
            stream_options={"include_usage": True} # Track tokens
        )

        full_content = ""
        tool_calls = []

        async for chunk in response:
            # Handle Usage (last chunk usually)
            if hasattr(chunk, 'usage') and chunk.usage:
                log_token_usage(settings.OPENAI_MODEL, chunk.usage.prompt_tokens, chunk.usage.completion_tokens)
            
            if not chunk.choices: continue
            
            delta = chunk.choices[0].delta
            
            # Handle Tool Calls
            if delta.tool_calls:
                for tc_delta in delta.tool_calls:
                    if len(tool_calls) <= tc_delta.index:
                        tool_calls.append({
                            "id": tc_delta.id,
                            "type": "function",
                            "function": {"name": "", "arguments": ""}
                        })
                    
                    if tc_delta.function.name:
                        tool_calls[tc_delta.index]["function"]["name"] = tc_delta.function.name
                    if tc_delta.function.arguments:
                        tool_calls[tc_delta.index]["function"]["arguments"] += tc_delta.function.arguments

            # Handle Content
            if delta.content:
                full_content += delta.content
                yield delta.content

        # 5. Execute Tools if requested
        if tool_calls:
            logger.info(f"🛠️ Tool calls detected: {[tc['function']['name'] for tc in tool_calls]}")
            
            messages.append({
                "role": "assistant",
                "tool_calls": tool_calls
            })

            for tc in tool_calls:
                name = tc["function"]["name"]
                try:
                    args = json.loads(tc["function"]["arguments"])
                except:
                    args = {}
                
                result = await execute_tool(name, args)
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "name": name,
                    "content": json.dumps(result)
                })

            # Second LLM Pass
            final_response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                stream=True,
                stream_options={"include_usage": True}
            )

            async for chunk in final_response:
                if hasattr(chunk, 'usage') and chunk.usage:
                    log_token_usage(settings.OPENAI_MODEL, chunk.usage.prompt_tokens, chunk.usage.completion_tokens)
                
                if not chunk.choices: continue
                content = chunk.choices[0].delta.content
                if content:
                    full_content += content
                    yield content

        # 6. Post-processing
        elapsed = (time.perf_counter() - t0) * 1000
        log_latency("llm_stream", elapsed)
        
        importance = score_importance(user_text)
        append_message("user", user_text, importance)
        append_message("assistant", full_content, score_importance(full_content))
        
        # Trigger background reflection to update graph
        start_reflection_loop()

    except Exception as e:
        logger.error(f"LLM Error: {e}")
        yield f"ERROR: {str(e)}"
