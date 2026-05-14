import subprocess
import os
from typing import Optional
from tools.registry import registry, PERMISSION_AUTO, PERMISSION_CONFIRM
from utils.logger import logger
from config.settings import get_settings

settings = get_settings()

@registry.register(
    name="open_app",
    description="Opens a specific application on the Mac.",
    parameters={
        "type": "object",
        "properties": {
            "app_name": {"type": "string", "description": "The name of the application to open, e.g. 'Spotify', 'Google Chrome'."}
        },
        "required": ["app_name"]
    },
    permission=PERMISSION_AUTO, # Opening apps is generally safe
    tags=["system", "actions"]
)
async def open_app(app_name: str) -> str:
    try:
        subprocess.Popen(["open", "-a", app_name])
        return f"Successfully opened {app_name}."
    except Exception as e:
        return f"Failed to open {app_name}: {str(e)}"

@registry.register(
    name="web_search",
    description="Search the live web for real-time information.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query."}
        },
        "required": ["query"]
    },
    permission=PERMISSION_AUTO,
    tags=["web", "research"]
)
async def web_search(query: str) -> str:
    if not settings.TAVILY_API_KEY:
        return "Error: TAVILY_API_KEY is not configured."
    
    try:
        from tavily import TavilyClient
        tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)
        response = tavily.search(query=query, search_depth="advanced")
        
        results = []
        for res in response.get("results", [])[:3]:
            results.append(f"Title: {res['title']}\nURL: {res['url']}\nContent: {res['content']}\n")
            
        return "\n".join(results) if results else "No results found."
    except Exception as e:
        logger.error(f"Web search failed: {e}")
        return f"Search failed: {str(e)}"

@registry.register(
    name="system_control",
    description="Controls system settings like volume and brightness.",
    parameters={
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["volume_up", "volume_down", "mute", "unmute"], "description": "The system action to perform."}
        },
        "required": ["action"]
    },
    permission=PERMISSION_AUTO,
    tags=["system", "actions"]
)
async def system_control(action: str) -> str:
    try:
        if action == "volume_up":
            subprocess.run(["osascript", "-e", "set volume output volume (output volume of (get volume settings) + 10)"])
        elif action == "volume_down":
            subprocess.run(["osascript", "-e", "set volume output volume (output volume of (get volume settings) - 10)"])
        elif action == "mute":
            subprocess.run(["osascript", "-e", "set volume with output muted"])
        elif action == "unmute":
            subprocess.run(["osascript", "-e", "set volume without output muted"])
            
        return f"System action '{action}' performed successfully."
    except Exception as e:
        return f"Failed to perform system action: {str(e)}"
