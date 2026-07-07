import os
import json
import time
import asyncio
from typing import AsyncGenerator, List, Dict, Any

from config.settings import get_settings
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
        
        # Priority: OpenAI Cloud (if key exists) > Local Ollama
        if settings.OPENAI_API_KEY:
            api_key = settings.OPENAI_API_KEY
            base_url = settings.OPENAI_BASE_URL or "https://api.openai.com/v1"
        else:
            api_key = "ollama"
            base_url = settings.OLLAMA_BASE_URL
        
        if "localhost:11434" in base_url and not base_url.endswith("/v1"):
            base_url += "/v1"

        logger.info(f"🔌 LLM Link: {base_url}")
        _client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    return _client

def get_model():
    return settings.OPENAI_MODEL or "llama3"

async def stream_response(user_text: str, mode_name: str = "cinematic") -> AsyncGenerator[str, None]:
    t0 = time.perf_counter()
    client = get_client()
    mode = get_mode(mode_name)
    
    memory_ctx = assemble_context(user_text)

    system_prompt = mode.system_prompt
    if memory_ctx:
        system_prompt += f"\n\n[AUGMENTED CONTEXT]\n{memory_ctx}"
    
    messages = [{"role": "system", "content": system_prompt}]
    
    history = get_context_messages(max_messages=10)
    messages.extend(history)
    messages.append({"role": "user", "content": user_text})

    available_tools = registry.to_openai_tools()

    try:
        use_tools = available_tools and "localhost:11434" not in str(client.base_url)
        
        response = await client.chat.completions.create(
            model=get_model(),
            messages=messages,
            tools=available_tools if use_tools else None,
            tool_choice="auto" if use_tools else None,
            stream=True,
            stream_options={"include_usage": True}
        )

        full_content = ""
        tool_calls = []

        async for chunk in response:
            if hasattr(chunk, 'usage') and chunk.usage:
                log_token_usage(get_model(), chunk.usage.prompt_tokens, chunk.usage.completion_tokens)
            
            if not chunk.choices: continue
            
            delta = chunk.choices[0].delta
            
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

            if delta.content:
                full_content += delta.content
                yield delta.content

        if tool_calls:
            logger.info(f"🛠️ Tool calls: {[tc['function']['name'] for tc in tool_calls]}")
            messages.append({"role": "assistant", "tool_calls": tool_calls})

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

            final_response = await client.chat.completions.create(
                model=get_model(),
                messages=messages,
                stream=True,
                stream_options={"include_usage": True}
            )

            async for chunk in final_response:
                if hasattr(chunk, 'usage') and chunk.usage:
                    log_token_usage(get_model(), chunk.usage.prompt_tokens, chunk.usage.completion_tokens)
                
                if not chunk.choices: continue
                content = chunk.choices[0].delta.content
                if content:
                    full_content += content
                    yield content

        importance = score_importance(user_text)
        await append_message("user", user_text, importance)
        await append_message("assistant", full_content, score_importance(full_content))
        
        await start_reflection_loop()

    except Exception as e:
        logger.error(f"LLM Error: {e}")
        yield f"ERROR: {str(e)}"
