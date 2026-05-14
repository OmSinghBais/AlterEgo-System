from playwright.async_api import async_playwright
from tools.registry import registry, PERMISSION_AUTO, PERMISSION_CONFIRM
from core.logger import logger
from pathlib import Path
import time

SCREENSHOT_DIR = Path(__file__).resolve().parent.parent / "data" / "screenshots"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

@registry.register(
    name="browser_operator",
    description="Perform advanced browser operations like scraping, screenshots, and element interaction.",
    parameters={
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "The URL to visit"},
            "action": {"type": "string", "enum": ["scrape", "screenshot", "find_elements"], "default": "scrape"},
            "selector": {"type": "string", "description": "CSS selector for specific element interaction"}
        },
        "required": ["url"]
    },
    permission=PERMISSION_AUTO,
    tags=["browser", "automation"]
)
async def browser_operator(url: str, action: str = "scrape", selector: str = None) -> str:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        page = await context.new_page()
        
        try:
            await page.goto(url, timeout=15000, wait_until="networkidle")
            
            if action == "screenshot":
                filename = f"shot_{int(time.time())}.png"
                path = SCREENSHOT_DIR / filename
                await page.screenshot(path=str(path), full_page=True)
                await browser.close()
                return f"Screenshot saved to: {path}"
            
            elif action == "find_elements":
                if not selector: return "Error: Selector required for find_elements"
                elements = await page.query_selector_all(selector)
                results = [await e.inner_text() for e in elements]
                await browser.close()
                return f"Found {len(results)} elements matching '{selector}': {results[:5]}"
            
            else: # scrape
                content = await page.evaluate("document.body.innerText")
                await browser.close()
                return f"Content extracted from {url}:\n{content[:3000]}..."
                
        except Exception as e:
            await browser.close()
            logger.error(f"Browser operation failed: {e}")
            return f"Browser Error: {e}"
