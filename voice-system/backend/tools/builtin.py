"""
AlterEGO — Built-in Tools

5 starter tools for Module 3 readiness.
"""

import subprocess
import webbrowser
import json
from pathlib import Path
from tools.registry import registry, PERMISSION_AUTO, PERMISSION_CONFIRM


# ── open_app ─────────────────────────────────────────────────────────

@registry.register(
    name="open_app",
    description="Open a macOS application by name.",
    parameters={
        "type": "object",
        "properties": {
            "app_name": {
                "type": "string",
                "description": "Name of the app, e.g. 'Spotify', 'Safari', 'Terminal'",
            }
        },
        "required": ["app_name"],
    },
    permission=PERMISSION_AUTO,
    tags=["system", "macos"],
)
async def open_app(app_name: str) -> str:
    try:
        subprocess.Popen(["open", "-a", app_name])
        return f"Opened {app_name}"
    except Exception as e:
        return f"Failed to open {app_name}: {e}"


# ── open_website ─────────────────────────────────────────────────────

@registry.register(
    name="open_website",
    description="Open a URL in the default browser.",
    parameters={
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "Full URL to open, e.g. 'https://github.com'",
            }
        },
        "required": ["url"],
    },
    permission=PERMISSION_AUTO,
    tags=["browser", "web"],
)
async def open_website(url: str) -> str:
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    webbrowser.open(url)
    return f"Opened {url}"


# ── google_search ────────────────────────────────────────────────────

@registry.register(
    name="google_search",
    description="Search Google for a query and open results in browser.",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query",
            }
        },
        "required": ["query"],
    },
    permission=PERMISSION_AUTO,
    tags=["search", "web"],
)
async def google_search(query: str) -> str:
    import urllib.parse
    url = f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}"
    webbrowser.open(url)
    return f"Searched Google for: {query}"


# ── control_volume ───────────────────────────────────────────────────

@registry.register(
    name="control_volume",
    description="Set macOS system volume (0-100).",
    parameters={
        "type": "object",
        "properties": {
            "level": {
                "type": "integer",
                "description": "Volume level 0-100",
                "minimum": 0,
                "maximum": 100,
            }
        },
        "required": ["level"],
    },
    permission=PERMISSION_AUTO,
    tags=["system", "audio"],
)
async def control_volume(level: int) -> str:
    level = max(0, min(100, level))
    # macOS volume is 0-7 for osascript
    mac_vol = round(level * 7 / 100)
    subprocess.run(
        ["osascript", "-e", f"set volume output volume {level}"],
        capture_output=True,
    )
    return f"Volume set to {level}%"


# ── create_note ──────────────────────────────────────────────────────

NOTES_DIR = Path(__file__).resolve().parent.parent / "data" / "notes"


@registry.register(
    name="create_note",
    description="Save a quick note to local storage.",
    parameters={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Note title",
            },
            "content": {
                "type": "string",
                "description": "Note content",
            },
        },
        "required": ["title", "content"],
    },
    permission=PERMISSION_AUTO,
    tags=["notes", "productivity"],
)
async def create_note(title: str, content: str) -> str:
    import time
    NOTES_DIR.mkdir(parents=True, exist_ok=True)
    ts = int(time.time())
    safe_title = "".join(c if c.isalnum() or c in " -_" else "" for c in title)
    filepath = NOTES_DIR / f"{ts}_{safe_title}.md"
    filepath.write_text(f"# {title}\n\n{content}\n")
    return f"Note saved: {title}"


# ── get_system_stats ─────────────────────────────────────────────────

@registry.register(
    name="get_system_stats",
    description="Get real-time CPU and memory usage of the host machine.",
    parameters={"type": "object", "properties": {}},
    permission=PERMISSION_AUTO,
    tags=["system", "monitoring"],
)
async def get_system_stats() -> str:
    import psutil
    cpu = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory().percent
    return f"System Stats — CPU: {cpu}%, Memory: {mem}%"


# ── duckduckgo_search ────────────────────────────────────────────────

@registry.register(
    name="duckduckgo_search",
    description="Search the web for information using DuckDuckGo.",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query",
            }
        },
        "required": ["query"],
    },
    permission=PERMISSION_AUTO,
    tags=["search", "web"],
)
async def duckduckgo_search(query: str) -> str:
    # This is a simulation using webbrowser since we don't want to install extra search libs yet
    import urllib.parse
    url = f"https://duckduckgo.com/?q={urllib.parse.quote_plus(query)}"
    webbrowser.open(url)
    return f"Searching the web for: {query}"


# ── scrape_website ───────────────────────────────────────────────────

@registry.register(
    name="scrape_website",
    description="Extract text content from any public website URL.",
    parameters={
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "The URL to scrape",
            }
        },
        "required": ["url"],
    },
    permission=PERMISSION_AUTO,
    tags=["browser", "web"],
)
async def scrape_website(url: str) -> str:
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(url, timeout=10000)
            text = await page.evaluate("document.body.innerText")
            await browser.close()
            return text[:5000] # Limit to 5k chars for LLM context
        except Exception as e:
            await browser.close()
            return f"Scraping failed: {e}"


# ── run_autonomous_workflow ──────────────────────────────────────────

@registry.register(
    name="run_autonomous_workflow",
    description="Trigger a multi-step autonomous agent to achieve a complex goal in the background.",
    parameters={
        "type": "object",
        "properties": {
            "goal": {
                "type": "string",
                "description": "The complex goal, e.g. 'Research Apple's latest product and save a summary'",
            }
        },
        "required": ["goal"],
    },
    permission=PERMISSION_CONFIRM, # ALWAYS confirm for background agents
    tags=["agents", "workflows"],
)
async def run_autonomous_workflow(goal: str) -> str:
    from jobs.queue import enqueue_job
    from workflows.engine import run_autonomous_task
    
    # Offload to Redis background job
    enqueue_job(run_autonomous_task, goal)
    return f"Autonomous agent activated for goal: {goal}. I will notify you once the work is complete."
