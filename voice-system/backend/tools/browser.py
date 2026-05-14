import asyncio
from playwright.async_api import async_playwright
from tools.registry import registry, PERMISSION_AUTO
from utils.logger import logger

class BrowserTool:
    def __init__(self):
        self.pw = None
        self.browser = None
        self.context = None

    async def start(self):
        if not self.browser:
            self.pw = await async_playwright().start()
            self.browser = await self.pw.chromium.launch(headless=True)
            self.context = await self.browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
            logger.info("🌐 Browser Agent initialized.")

    async def close(self):
        if self.browser:
            await self.browser.close()
            await self.pw.stop()
            self.browser = None
            logger.info("🌐 Browser Agent shut down.")

    async def search(self, query: str) -> str:
        """Search the web using DuckDuckGo."""
        await self.start()
        page = await self.context.new_page()
        try:
            await page.goto(f"https://duckduckgo.com/html/?q={query}")
            # Wait for results
            results = await page.query_selector_all(".result__body")
            texts = []
            for r in results[:5]:
                title = await r.query_selector(".result__title")
                snippet = await r.query_selector(".result__snippet")
                if title and snippet:
                    texts.append(f"Title: {await title.inner_text()}\nSnippet: {await snippet.inner_text()}\n")
            return "\n".join(texts) or "No results found."
        finally:
            await page.close()

    async def scrape(self, url: str) -> str:
        """Scrape a website and return text content."""
        await self.start()
        page = await self.context.new_page()
        try:
            await page.goto(url, wait_until="networkidle")
            # Basic text extraction
            content = await page.evaluate("() => document.body.innerText")
            return content[:5000] # Limit for context
        finally:
            await page.close()

browser_tool = BrowserTool()

@registry.register(
    name="browser_search",
    description="Search the web for information using a browser.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query."}
        },
        "required": ["query"]
    },
    permission=PERMISSION_AUTO,
    tags=["browser", "research"]
)
async def browser_search(query: str) -> str:
    return await browser_tool.search(query)

@registry.register(
    name="browser_scrape",
    description="Visit a URL and extract text content.",
    parameters={
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "The URL to visit."}
        },
        "required": ["url"]
    },
    permission=PERMISSION_AUTO,
    tags=["browser", "research"]
)
async def browser_scrape(url: str) -> str:
    return await browser_tool.scrape(url)
