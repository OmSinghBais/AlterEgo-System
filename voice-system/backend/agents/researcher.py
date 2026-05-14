from typing import List, Dict, Any
from agents.base_agent import BaseAgent
from config.settings import get_settings
from utils.logger import logger

settings = get_settings()

class ResearcherAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Researcher", role="Information Gatherer")

    async def search_and_synthesize(self, query: str) -> str:
        """Search the web and provide a synthesized summary."""
        from tools.executor import execute_tool
        from llm import get_client, get_model
        
        client = get_client()
        model = get_model()

        # 1. Search
        logger.info(f"🔍 Searching for: {query}")
        search_results = await execute_tool("browser_search", {"query": query})
        
        # 2. Synthesize
        prompt = f"""
        Query: {query}
        
        Search Results:
        {search_results}
        
        Synthesize these results into a clear, factual report. 
        If more information is needed (e.g. from a specific URL), mention it.
        """
        
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": "You are a research analyst."},
                      {"role": "user", "content": prompt}]
        )
        
        return response.choices[0].message.content or ""

    async def deep_research(self, topic: str):
        """Perform multi-step research by scraping specific pages."""
        # TODO: Implement autonomous navigation logic
        pass

researcher = ResearcherAgent()
