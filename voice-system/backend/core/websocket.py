"""
Enhanced WebSocket Client with Error Recovery
Handles reconnection, buffering, and graceful degradation.
"""
import asyncio
from typing import Callable, Optional, Dict, Any
from datetime import datetime
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class ConnectionState(str, Enum):
    """WebSocket connection states."""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"
    FAILED = "failed"


class WebSocketClient:
    """
    Enhanced WebSocket client with automatic reconnection and buffering.
    
    Features:
    - Automatic exponential backoff reconnection
    - Message buffering during disconnection
    - Heartbeat mechanism
    - Error recovery
    """
    
    def __init__(
        self,
        uri: str,
        on_connect: Optional[Callable] = None,
        on_message: Optional[Callable] = None,
        on_disconnect: Optional[Callable] = None,
        on_error: Optional[Callable] = None,
        max_reconnect_attempts: int = 10,
        heartbeat_interval: int = 30,
    ):
        self.uri = uri
        self.on_connect = on_connect
        self.on_message = on_message
        self.on_disconnect = on_disconnect
        self.on_error = on_error
        
        self.state = ConnectionState.DISCONNECTED
        self.ws = None
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = max_reconnect_attempts
        self.heartbeat_interval = heartbeat_interval
        
        # Message buffer for offline period
        self.message_buffer = []
        self.max_buffer_size = 1000
        
        # Metrics
        self.messages_sent = 0
        self.messages_received = 0
        self.errors_occurred = 0
        self.last_heartbeat = None
    
    async def connect(self):
        """Establish WebSocket connection."""
        try:
            import websockets
            
            logger.info(f"🔌 Connecting to {self.uri}...")
            self.state = ConnectionState.CONNECTING
            
            self.ws = await websockets.connect(self.uri)
            self.state = ConnectionState.CONNECTED
            self.reconnect_attempts = 0
            self.last_heartbeat = datetime.utcnow()
            
            logger.info("✅ WebSocket connected")
            
            if self.on_connect:
                await self._call_handler(self.on_connect)
            
            # Flush buffered messages
            await self._flush_buffer()
            
            # Start heartbeat
            asyncio.create_task(self._heartbeat())
            
            # Start listening
            asyncio.create_task(self._listen())
            
        except Exception as e:
            logger.error(f"❌ Connection failed: {e}")
            self.state = ConnectionState.FAILED
            self.errors_occurred += 1
            
            if self.on_error:
                await self._call_handler(self.on_error, e)
            
            await self._reconnect()
    
    async def send(self, message: str | Dict[str, Any]) -> bool:
        """
        Send message with automatic buffering on disconnect.
        
        Returns:
            True if sent immediately, False if buffered
        """
        if isinstance(message, dict):
            import json
            message = json.dumps(message)
        
        # Try to send if connected
        if self.state == ConnectionState.CONNECTED and self.ws:
            try:
                await self.ws.send(message)
                self.messages_sent += 1
                return True
            except Exception as e:
                logger.warning(f"Send failed: {e}")
                self.state = ConnectionState.DISCONNECTED
        
        # Buffer message for later
        if len(self.message_buffer) < self.max_buffer_size:
            self.message_buffer.append(message)
            logger.debug(f"📦 Message buffered ({len(self.message_buffer)}/{self.max_buffer_size})")
            return False
        else:
            logger.error("❌ Message buffer full - message dropped")
            return False
    
    async def disconnect(self):
        """Close WebSocket connection gracefully."""
        try:
            if self.ws:
                await self.ws.close()
            
            self.state = ConnectionState.DISCONNECTED
            logger.info("🔌 WebSocket disconnected")
            
            if self.on_disconnect:
                await self._call_handler(self.on_disconnect)
        
        except Exception as e:
            logger.error(f"Error during disconnect: {e}")
    
    async def _listen(self):
        """Listen for incoming messages."""
        while self.state == ConnectionState.CONNECTED:
            try:
                if not self.ws:
                    break
                
                message = await self.ws.recv()
                self.messages_received += 1
                self.last_heartbeat = datetime.utcnow()
                
                if self.on_message:
                    await self._call_handler(self.on_message, message)
            
            except Exception as e:
                if self.state == ConnectionState.CONNECTED:
                    logger.warning(f"⚠️ Receive error: {e}")
                    self.errors_occurred += 1
                    self.state = ConnectionState.DISCONNECTED
                    await self._reconnect()
                break
    
    async def _heartbeat(self):
        """Send periodic heartbeat to detect stale connections."""
        while self.state == ConnectionState.CONNECTED:
            try:
                await asyncio.sleep(self.heartbeat_interval)
                
                if self.ws and self.state == ConnectionState.CONNECTED:
                    await self.ws.ping()
                    self.last_heartbeat = datetime.utcnow()
                    logger.debug("💓 Heartbeat sent")
            
            except Exception as e:
                logger.warning(f"Heartbeat failed: {e}")
                self.state = ConnectionState.DISCONNECTED
                await self._reconnect()
    
    async def _reconnect(self):
        """Reconnect with exponential backoff."""
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("❌ Max reconnection attempts reached")
            self.state = ConnectionState.FAILED
            return
        
        self.reconnect_attempts += 1
        backoff = min(2 ** (self.reconnect_attempts - 1), 60)  # Cap at 60s
        
        logger.info(
            f"🔄 Reconnecting (attempt {self.reconnect_attempts}/{self.max_reconnect_attempts}) "
            f"in {backoff}s..."
        )
        
        self.state = ConnectionState.RECONNECTING
        await asyncio.sleep(backoff)
        await self.connect()
    
    async def _flush_buffer(self):
        """Send all buffered messages."""
        while self.message_buffer and self.state == ConnectionState.CONNECTED:
            message = self.message_buffer.pop(0)
            try:
                await self.ws.send(message)
                self.messages_sent += 1
            except Exception as e:
                logger.error(f"Failed to send buffered message: {e}")
                self.message_buffer.insert(0, message)  # Re-buffer
                break
        
        if self.message_buffer:
            logger.info(f"💾 {len(self.message_buffer)} messages still buffered")
    
    async def _call_handler(self, handler: Callable, *args, **kwargs):
        """Call handler with error handling."""
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(*args, **kwargs)
            else:
                handler(*args, **kwargs)
        except Exception as e:
            logger.error(f"Handler error: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get connection statistics."""
        uptime = (datetime.utcnow() - self.last_heartbeat).total_seconds() if self.last_heartbeat else 0
        
        return {
            "state": self.state.value,
            "messages_sent": self.messages_sent,
            "messages_received": self.messages_received,
            "buffered_messages": len(self.message_buffer),
            "errors": self.errors_occurred,
            "reconnect_attempts": self.reconnect_attempts,
            "uptime_seconds": max(0, self.heartbeat_interval - uptime),
        }


# Global client instance
_ws_client: Optional[WebSocketClient] = None


async def get_ws_client(
    uri: str,
    on_connect=None,
    on_message=None,
    on_disconnect=None,
    on_error=None,
) -> WebSocketClient:
    """Get or create WebSocket client."""
    global _ws_client
    
    if _ws_client is None:
        _ws_client = WebSocketClient(
            uri,
            on_connect=on_connect,
            on_message=on_message,
            on_disconnect=on_disconnect,
            on_error=on_error,
        )
        await _ws_client.connect()
    
    return _ws_client
