"""
Rate Limiting Middleware for AlterEGO Backend
Prevents API abuse and ensures fair resource usage.
"""
import time
from typing import Optional, Dict, Tuple
from collections import defaultdict
from fastapi import Request
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Token bucket rate limiter.
    
    Attributes:
        requests_per_minute: Max requests per minute per user
        burst_size: Max burst (concurrent requests)
    """
    
    def __init__(self, requests_per_minute: int = 60, burst_size: int = 10):
        self.rpm = requests_per_minute
        self.burst = burst_size
        self.buckets: Dict[str, Tuple[float, int]] = {}  # user_id -> (tokens, last_update)
        self.cleanup_interval = 300  # Cleanup every 5 minutes
        self.last_cleanup = time.time()
    
    def get_user_id(self, request: Request) -> str:
        """Extract user identifier from request."""
        # Priority: user claim > IP address
        user = getattr(request.state, "user", None)
        if user and hasattr(user, "user_id"):
            return f"user:{user.user_id}"
        
        # Fallback to IP-based limiting
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"
    
    def is_allowed(self, user_id: str, tokens_required: int = 1) -> Tuple[bool, Dict[str, any]]:
        """
        Check if request is allowed under rate limit.
        
        Returns:
            (allowed: bool, info: dict with remaining tokens and retry_after)
        """
        now = time.time()
        
        # Cleanup old buckets periodically
        if now - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_buckets(now)
            self.last_cleanup = now
        
        # Get or create token bucket
        if user_id not in self.buckets:
            self.buckets[user_id] = (self.burst, now)
        
        tokens, last_update = self.buckets[user_id]
        
        # Add tokens based on time elapsed
        time_passed = now - last_update
        tokens_to_add = (time_passed / 60.0) * self.rpm  # tokens per second
        tokens = min(self.burst, tokens + tokens_to_add)
        
        # Check if allowed
        allowed = tokens >= tokens_required
        
        info = {
            "allowed": allowed,
            "remaining": max(0, int(tokens - tokens_required)),
            "limit": self.rpm,
            "reset_in": self._get_reset_time(tokens, tokens_required),
        }
        
        if allowed:
            tokens -= tokens_required
            self.buckets[user_id] = (tokens, now)
            info["status"] = "ok"
        else:
            retry_after = (tokens_required - tokens) / (self.rpm / 60.0)
            info["retry_after"] = int(retry_after) + 1
            info["status"] = "rate_limited"
        
        return allowed, info
    
    def _get_reset_time(self, tokens: float, tokens_required: int) -> int:
        """Calculate seconds until next token becomes available."""
        if tokens >= tokens_required:
            return 0
        
        needed = tokens_required - tokens
        seconds_per_token = 60.0 / self.rpm
        return int(needed * seconds_per_token) + 1
    
    def _cleanup_old_buckets(self, now: float, max_age_seconds: int = 3600):
        """Remove old bucket entries."""
        expired = [
            user_id for user_id, (_, last_update) in self.buckets.items()
            if now - last_update > max_age_seconds
        ]
        
        for user_id in expired:
            del self.buckets[user_id]
        
        if expired:
            logger.info(f"Rate limiter: cleaned up {len(expired)} old buckets")


class RateLimitMiddleware:
    """
    FastAPI middleware for rate limiting.
    
    Usage:
        app.add_middleware(RateLimitMiddleware, limiter=rate_limiter)
    """
    
    # Different limits for different endpoints
    ENDPOINT_LIMITS = {
        "/api/chat": {"rpm": 60, "burst": 5},
        "/api/voice": {"rpm": 30, "burst": 3},
        "/api/tools": {"rpm": 30, "burst": 2},
        "/ws/voice": {"rpm": 10, "burst": 1},  # WebSocket
    }
    
    DEFAULT_LIMIT = {"rpm": 100, "burst": 10}
    
    def __init__(self, app, limiter: Optional[RateLimiter] = None):
        self.app = app
        self.limiter = limiter or RateLimiter()
    
    async def __call__(self, request: Request, call_next):
        """Process request through rate limiter."""
        
        # Extract endpoint
        endpoint = request.url.path
        
        # Get limit for this endpoint
        if endpoint in self.ENDPOINT_LIMITS:
            limit_config = self.ENDPOINT_LIMITS[endpoint]
        else:
            # Check if path matches pattern
            limit_config = self._find_matching_limit(endpoint)
        
        # Create limiter for this endpoint if needed
        user_id = self.limiter.get_user_id(request)
        
        # Check rate limit
        allowed, info = self.limiter.is_allowed(user_id, tokens_required=1)
        
        # Add rate limit headers to response
        request.state.rate_limit_info = info
        
        if not allowed:
            # Rate limited
            from fastapi import HTTPException, status
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Retry after {info['retry_after']} seconds",
                headers={
                    "X-RateLimit-Limit": str(info["limit"]),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + info["retry_after"]),
                    "Retry-After": str(info["retry_after"]),
                },
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + info["reset_in"])
        
        return response
    
    def _find_matching_limit(self, endpoint: str) -> Dict[str, int]:
        """Find matching endpoint pattern."""
        # Simple prefix matching for now
        for pattern, limit in self.ENDPOINT_LIMITS.items():
            if endpoint.startswith(pattern):
                return limit
        
        return self.DEFAULT_LIMIT


# Global rate limiter instance
rate_limiter = RateLimiter(requests_per_minute=100, burst_size=10)


# Endpoints with specialized limiters
CHAT_LIMITER = RateLimiter(requests_per_minute=60, burst_size=5)
VOICE_LIMITER = RateLimiter(requests_per_minute=30, burst_size=3)
TOOL_LIMITER = RateLimiter(requests_per_minute=30, burst_size=2)
