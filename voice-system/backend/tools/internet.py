import os
import aiohttp
import json
from typing import Optional, Dict, Any
from tools.registry import registry, PERMISSION_AUTO
from core.settings import get_settings
from core.logger import logger

settings = get_settings()

# ── search_web (Tavily) ─────────────────────────────────────────────

@registry.register(
    name="search_web",
    description="Search the live internet for up-to-date information.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "The search query"},
            "depth": {"type": "string", "enum": ["basic", "advanced"], "default": "basic"}
        },
        "required": ["query"]
    },
    permission=PERMISSION_AUTO,
    tags=["internet", "search"]
)
async def search_web(query: str, depth: str = "basic") -> str:
    if not settings.TAVILY_API_KEY:
        return "ERROR: Tavily API Key not configured. Please use duckduckgo_search instead."
    
    from tavily import TavilyClient
    tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)
    
    try:
        # We use the sync client in a thread for now or check if there's an async one
        # For simplicity in this env, we'll use aiohttp to call their endpoint directly
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": settings.TAVILY_API_KEY,
            "query": query,
            "search_depth": depth,
            "include_answer": True
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                data = await resp.json()
                results = data.get("results", [])
                answer = data.get("answer", "")
                
                output = f"Answer: {answer}\n\nTop Results:\n"
                for r in results[:3]:
                    output += f"- {r['title']}: {r['url']}\n  Snippet: {r['content'][:200]}...\n"
                return output
    except Exception as e:
        logger.error(f"Tavily search failed: {e}")
        return f"Search failed: {e}"


# ── get_crypto_price ────────────────────────────────────────────────

@registry.register(
    name="get_crypto_price",
    description="Get current price of a cryptocurrency (e.g. bitcoin, ethereum).",
    parameters={
        "type": "object",
        "properties": {
            "symbol": {"type": "string", "description": "ID of the coin, e.g. 'bitcoin', 'solana'"}
        },
        "required": ["symbol"]
    },
    permission=PERMISSION_AUTO,
    tags=["internet", "finance"]
)
async def get_crypto_price(symbol: str) -> str:
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol.lower()}&vs_currencies=usd"
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as resp:
                data = await resp.json()
                price = data.get(symbol.lower(), {}).get("usd")
                if price:
                    return f"The current price of {symbol.capitalize()} is ${price:,.2f} USD."
                return f"Could not find price for {symbol}."
        except Exception as e:
            return f"API Error: {e}"


# ── get_weather ─────────────────────────────────────────────────────

@registry.register(
    name="get_weather",
    description="Get current weather for a specific city.",
    parameters={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name, e.g. 'London', 'New York'"}
        },
        "required": ["city"]
    },
    permission=PERMISSION_AUTO,
    tags=["internet", "weather"]
)
async def get_weather(city: str) -> str:
    # Using a free public weather API (wttr.in) for demonstration without keys
    url = f"https://wttr.in/{city}?format=%C+%t+%w"
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as resp:
                data = await resp.text()
                return f"Weather in {city}: {data}"
        except Exception as e:
            return f"Weather API Error: {e}"
