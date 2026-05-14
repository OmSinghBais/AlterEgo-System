import time
from typing import List, Optional
from datetime import datetime, timedelta
from memory import get_db
from db.models import Conversation, LongTermMemory
from tools.registry import registry, PERMISSION_AUTO

def parse_time_relative(relative_str: str) -> Optional[float]:
    """
    Parses strings like 'yesterday', '2 hours ago', 'last week'.
    Returns a unix timestamp.
    """
    now = datetime.now()
    r = relative_str.lower()
    
    if "yesterday" in r:
        target = now - timedelta(days=1)
    elif "hour" in r:
        try:
            num = int(''.join(filter(str.isdigit, r)))
            target = now - timedelta(hours=num)
        except: target = now
    elif "day" in r:
        try:
            num = int(''.join(filter(str.isdigit, r)))
            target = now - timedelta(days=num)
        except: target = now
    else:
        return None
        
    return target.timestamp()

@registry.register(
    name="search_history_by_time",
    description="Search for past conversation messages or events within a specific time range.",
    parameters={
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Keyword or topic to look for."},
            "time_range": {"type": "string", "description": "Relative time e.g. 'yesterday', 'last 2 hours', 'last week'."}
        },
        "required": ["time_range"]
    },
    permission=PERMISSION_AUTO,
    tags=["memory", "temporal"]
)
async def search_history_by_time(time_range: str, query: str = None) -> str:
    """
    Jarvis uses this tool to 'remember' things from specific time periods.
    """
    start_ts = parse_time_relative(time_range)
    if not start_ts:
        return f"I couldn't understand the time range '{time_range}'. Try 'yesterday' or 'last 2 hours'."

    db = get_db()
    try:
        # Search raw conversations
        q = db.query(Conversation).filter(Conversation.timestamp >= start_ts)
        if query:
            q = q.filter(Conversation.content.contains(query))
        
        msgs = q.order_by(Conversation.timestamp.asc()).all()
        
        if not msgs:
            return f"I found no records matching that query since {time_range}."
            
        result = [f"--- Records from {time_range} ---"]
        for m in msgs:
            dt = datetime.fromtimestamp(m.timestamp).strftime('%Y-%m-%d %H:%M')
            result.append(f"[{dt}] {m.role.upper()}: {m.content}")
            
        return "\n".join(result[:20]) # Limit output to prevent context overflow
    finally:
        db.close()
