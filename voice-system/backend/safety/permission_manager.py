import re
from typing import Dict, Any, Tuple
from utils.logger import logger

# Permission Levels
PERMISSION_AUTO = "auto"     # Execute without asking
PERMISSION_MANUAL = "manual" # Require user approval
PERMISSION_BLOCKED = "blocked" # Never execute

class SafetyLayer:
    def __init__(self):
        # Default permissions for tools
        self.tool_permissions = {
            "browser_search": PERMISSION_AUTO,
            "browser_scrape": PERMISSION_AUTO,
            "save_to_desktop": PERMISSION_MANUAL,
            "terminal_execute": PERMISSION_MANUAL,
            "delete_file": PERMISSION_BLOCKED,
            "vision_screen_analysis": PERMISSION_AUTO
        }
        
        # Dangerous command patterns (RegEx)
        self.dangerous_patterns = [
            r"rm\s+-rf",
            r"sudo",
            r"mv\s+.*\s+/",
            r"chmod\s+777",
            r":\(\)\{ :\|:& \};:" # Fork bomb
        ]

    def validate_tool_call(self, tool_name: str, args: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate if a tool call is safe and permitted.
        Returns (is_safe, reason).
        """
        permission = self.tool_permissions.get(tool_name, PERMISSION_MANUAL)
        
        if permission == PERMISSION_BLOCKED:
            return False, f"Tool '{tool_name}' is permanently blocked for safety."
        
        # Specific check for terminal commands
        if tool_name == "terminal_execute":
            command = args.get("command", "")
            for pattern in self.dangerous_patterns:
                if re.search(pattern, command):
                    return False, f"Dangerous command detected: {command}"
        
        return True, permission

    async def request_approval(self, tool_name: str, args: Dict[str, Any]) -> bool:
        """
        Simulate a human-in-the-loop checkpoint.
        In a real scenario, this would send a push notification or UI prompt.
        """
        logger.warning(f"🛡️ SAFETY CHECK: Requesting approval for {tool_name} with {args}")
        # For this demo, we'll assume the user is okay if it's not a block-listed tool
        return True

safety_layer = SafetyLayer()
