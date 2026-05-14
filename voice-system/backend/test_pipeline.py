"""
AlterEGO — Module 3 Integration Test
Verifies the full pipeline: Text/Audio -> LLM -> Event Bus -> Output
"""

import asyncio
import json
import httpx
from logger import logger

BACKEND_URL = "http://localhost:8000"


async def test_chat():
    logger.info("🧪 Testing HTTP /chat endpoint...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{BACKEND_URL}/chat",
                json={"message": "Hello AlterEGO, describe your current module."},
                timeout=30.0
            )
            if resp.status_code == 200:
                data = resp.json()
                logger.success(f"✅ Chat response: {data['response'][:100]}...")
                return True
            else:
                logger.error(f"❌ Chat failed: {resp.status_code} - {resp.text}")
                return False
        except Exception as e:
            logger.error(f"❌ Chat connection error: {e}")
            return False


async def test_health():
    logger.info("🧪 Testing HTTP /health endpoint...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{BACKEND_URL}/health")
            if resp.status_code == 200:
                data = resp.json()
                logger.success(f"✅ Health status: {data['status']}")
                logger.info(f"Subsystems: {json.dumps(data['subsystems'], indent=2)}")
                return True
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return False


async def main():
    logger.info("🚀 Starting Module 3 Integration Tests...")
    
    # 1. Health
    h = await test_health()
    if not h:
        logger.warning("Backend might not be running. Start main.py first!")
        return

    # 2. Chat
    await test_chat()

    logger.info("🏁 Integration tests complete.")


if __name__ == "__main__":
    asyncio.run(main())
