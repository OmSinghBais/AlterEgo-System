import asyncio
import json
import re
import time
from fastapi import WebSocket, WebSocketDisconnect

from utils.logger import logger, log_latency, log_ws_event
from api.state import connected_clients, set_conversation_active
from personality import DEFAULT_MODE
from memory import append_message, score_importance
from error_handler import safe_send, handle_stt_error, handle_llm_error, handle_tts_error
from stt.engine import transcribe
from tts.engine import synthesize
from llm import stream_response
from events.event_bus import bus
from events.event_bus import (
    CONVERSATION_STARTED, CONVERSATION_ENDED,
    STT_STARTED, STT_FINISHED, LLM_STARTED, LLM_FIRST_TOKEN,
    LLM_FINISHED, TTS_STARTED, TTS_FINISHED, INTERRUPT_RECEIVED,
)
from tools import execute_tool

_SENTENCE_END = re.compile(r'(?<=[.!?])\s+')

def split_sentences(text: str) -> list[str]:
    parts = _SENTENCE_END.split(text.strip())
    return [p.strip() for p in parts if p.strip()]

async def run_voice_pipeline(
    ws: WebSocket,
    user_text: str,
    mode: str,
    interrupted: dict,
) -> None:
    t0 = time.perf_counter()
    set_conversation_active(True)
    await bus.emit(CONVERSATION_STARTED, {"mode": mode})

    try:
        await safe_send(ws, {"type": "status", "content": "thinking", "sub": "generating"})
        importance = score_importance(user_text)
        append_message("user", user_text, importance=importance)

        await bus.emit(LLM_STARTED, {"text": user_text})

        full_response = ""
        sentence_buffer = ""
        tts_tasks: list[asyncio.Task] = []
        first_token = True

        await safe_send(ws, {"type": "status", "content": "speaking"})

        async for chunk in stream_response(user_text, mode):
            if interrupted.get("flag"):
                break
            full_response += chunk
            sentence_buffer += chunk
            
            await safe_send(ws, {"type": "token", "content": chunk})

            if first_token:
                await bus.emit(LLM_FIRST_TOKEN, {"latency_ms": (time.perf_counter() - t0) * 1000})
                first_token = False

            sentences = split_sentences(sentence_buffer)
            if len(sentences) > 1:
                for sent in sentences[:-1]:
                    if not interrupted.get("flag"):
                        await bus.emit(TTS_STARTED, {"text": sent[:50]})
                        task = asyncio.create_task(_tts_and_send(ws, sent, interrupted))
                        tts_tasks.append(task)
                sentence_buffer = sentences[-1]

        if sentence_buffer.strip() and not interrupted.get("flag"):
            await bus.emit(TTS_STARTED, {"text": sentence_buffer[:50]})
            task = asyncio.create_task(_tts_and_send(ws, sentence_buffer, interrupted))
            tts_tasks.append(task)

        if tts_tasks:
            await asyncio.gather(*tts_tasks, return_exceptions=True)

        await bus.emit(LLM_FINISHED, {"length": len(full_response)})

        if not interrupted.get("flag"):
            append_message("assistant", full_response)
            await safe_send(ws, {"type": "token", "content": "", "done": True})

        elapsed = (time.perf_counter() - t0) * 1000
        log_latency("pipeline_total", elapsed)

    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        fallback = await handle_llm_error(e)
        await safe_send(ws, {"type": "token", "content": fallback, "done": True})
    finally:
        await safe_send(ws, {"type": "state", "state": "idle"})
        set_conversation_active(False)
        await bus.emit(CONVERSATION_ENDED, {})

async def _tts_and_send(ws: WebSocket, text: str, interrupted: dict) -> None:
    if interrupted.get("flag"):
        return
    try:
        loop = asyncio.get_event_loop()
        audio = await loop.run_in_executor(None, synthesize, text)
        if not interrupted.get("flag") and audio:
            await safe_send(ws, audio)
            await bus.emit(TTS_FINISHED, {"bytes": len(audio)})
    except Exception as e:
        await handle_tts_error(e)

async def voice_ws_handler(ws: WebSocket):
    await ws.accept()
    connected_clients.add(ws)
    log_ws_event("connected")

    current_mode = DEFAULT_MODE
    interrupted = {"flag": False}

    try:
        while True:
            raw = await ws.receive()

            if "text" in raw:
                data = json.loads(raw["text"])
                cmd = data.get("type", "")

                if cmd == "interrupt":
                    interrupted["flag"] = True
                    await bus.emit(INTERRUPT_RECEIVED, {})

                elif cmd == "text_input":
                    user_text = data.get("text", "").strip()
                    if user_text:
                        interrupted["flag"] = False
                        await run_voice_pipeline(ws, user_text, current_mode, interrupted)

                elif cmd == "ping":
                    await safe_send(ws, {"type": "pong"})

            if "bytes" in raw:
                interrupted["flag"] = False
                set_conversation_active(True)
                await safe_send(ws, {"type": "state", "state": "listening"})
                await bus.emit(STT_STARTED, {})

                try:
                    loop = asyncio.get_event_loop()
                    user_text = await loop.run_in_executor(None, transcribe, raw["bytes"])
                except Exception as e:
                    user_text = await handle_stt_error(e)

                await bus.emit(STT_FINISHED, {"text": user_text[:50] if user_text else ""})

                if user_text.strip():
                    await safe_send(ws, {"type": "transcript_user", "text": user_text})
                    await run_voice_pipeline(ws, user_text, current_mode, interrupted)
                else:
                    await safe_send(ws, {"type": "state", "state": "idle"})

    except WebSocketDisconnect:
        pass
    finally:
        connected_clients.discard(ws)
        set_conversation_active(False)
        log_ws_event("disconnected")
