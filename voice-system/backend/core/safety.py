"""
Tool Permission & Safety Layer for AlterEGO
Restricts dangerous operations and requires user confirmation.
"""
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import hashlib


class ToolPermissionLevel(str, Enum):
    """Permission levels for different tool categories."""
    SAFE = "safe"  # Always allowed
    MODERATE = "moderate"  # Allowed, but logged
    DANGEROUS = "dangerous"  # Requires user confirmation
    RESTRICTED = "restricted"  # Never allowed


class ToolRisk(BaseModel):
    """Risk assessment for a tool operation."""
    tool_name: str
    operation: str
    risk_level: ToolPermissionLevel
    reason: str
    estimated_impact: str
    recovery_possible: bool


class PermissionRequest(BaseModel):
    """Request for user permission to execute dangerous operation."""
    request_id: str
    tool_name: str
    operation: str
    reason: str
    risk_assessment: ToolRisk
    timestamp: datetime
    expires_at: datetime  # Request expires after 5 minutes


class PermissionResponse(BaseModel):
    """User's response to permission request."""
    request_id: str
    approved: bool
    timestamp: datetime
    reason: Optional[str] = None


# Tool Permission Registry
TOOL_PERMISSIONS = {
    # File Operations
    "delete_file": {
        "level": ToolPermissionLevel.DANGEROUS,
        "reason": "Permanent file deletion",
        "recovery": False,
    },
    "delete_directory": {
        "level": ToolPermissionLevel.RESTRICTED,
        "reason": "Could delete entire system",
        "recovery": False,
    },
    "write_file": {
        "level": ToolPermissionLevel.MODERATE,
        "reason": "Modifies system files",
        "recovery": True,
    },
    "read_file": {
        "level": ToolPermissionLevel.SAFE,
        "reason": "Read-only operation",
        "recovery": True,
    },
    
    # Desktop Control
    "move_mouse": {
        "level": ToolPermissionLevel.MODERATE,
        "reason": "Desktop automation",
        "recovery": True,
    },
    "type_text": {
        "level": ToolPermissionLevel.MODERATE,
        "reason": "Keyboard automation",
        "recovery": True,
    },
    "click_button": {
        "level": ToolPermissionLevel.MODERATE,
        "reason": "Mouse automation",
        "recovery": True,
    },
    "open_app": {
        "level": ToolPermissionLevel.MODERATE,
        "reason": "Application launch",
        "recovery": True,
    },
    "shutdown_system": {
        "level": ToolPermissionLevel.RESTRICTED,
        "reason": "System shutdown - irreversible",
        "recovery": False,
    },
    
    # Browser Control
    "open_website": {
        "level": ToolPermissionLevel.SAFE,
        "reason": "Read-only web browsing",
        "recovery": True,
    },
    "submit_form": {
        "level": ToolPermissionLevel.DANGEROUS,
        "reason": "Could submit sensitive data",
        "recovery": False,
    },
    "delete_cookies": {
        "level": ToolPermissionLevel.MODERATE,
        "reason": "Clears browser data",
        "recovery": False,
    },
    
    # System Control
    "run_terminal_command": {
        "level": ToolPermissionLevel.DANGEROUS,
        "reason": "Arbitrary code execution",
        "recovery": False,
    },
    "modify_system_settings": {
        "level": ToolPermissionLevel.RESTRICTED,
        "reason": "System configuration changes",
        "recovery": False,
    },
    
    # Safe Operations
    "search_web": {
        "level": ToolPermissionLevel.SAFE,
        "reason": "Information retrieval",
        "recovery": True,
    },
    "create_note": {
        "level": ToolPermissionLevel.SAFE,
        "reason": "Create personal notes",
        "recovery": True,
    },
    "set_reminder": {
        "level": ToolPermissionLevel.SAFE,
        "reason": "Schedule reminder",
        "recovery": True,
    },
}


class SafetyChecker:
    """Checks tool operations for safety and permissions."""
    
    def __init__(self):
        self.pending_requests: Dict[str, PermissionRequest] = {}
        self.approved_operations: Dict[str, bool] = {}
        self.denied_operations: List[str] = []
    
    def assess_operation(self, tool_name: str, operation: str, params: Dict[str, Any]) -> ToolRisk:
        """
        Assess risk of operation.
        
        Args:
            tool_name: Name of tool
            operation: Operation to perform
            params: Operation parameters
        
        Returns:
            ToolRisk assessment
        """
        permission_key = f"{tool_name}:{operation}"
        
        if permission_key not in TOOL_PERMISSIONS:
            # Unknown tool - treat as moderate risk
            return ToolRisk(
                tool_name=tool_name,
                operation=operation,
                risk_level=ToolPermissionLevel.MODERATE,
                reason="Unknown tool/operation",
                estimated_impact="Unassessed impact",
                recovery_possible=True,
            )
        
        perm = TOOL_PERMISSIONS[permission_key]
        
        return ToolRisk(
            tool_name=tool_name,
            operation=operation,
            risk_level=perm["level"],
            reason=perm["reason"],
            estimated_impact=self._estimate_impact(tool_name, operation, params),
            recovery_possible=perm["recovery"],
        )
    
    def _estimate_impact(self, tool_name: str, operation: str, params: Dict[str, Any]) -> str:
        """Estimate the impact of an operation based on parameters."""
        if tool_name == "file_ops" and operation == "delete_file":
            file_path = params.get("path", "unknown")
            return f"Will permanently delete: {file_path}"
        
        if tool_name == "system" and operation == "shutdown":
            return "System will shut down immediately"
        
        if tool_name == "browser" and operation == "submit_form":
            return f"Will submit form to {params.get('url', 'unknown')}"
        
        return "Operation will be executed on your system"
    
    def can_execute(self, risk: ToolRisk) -> bool:
        """
        Check if operation can be executed without confirmation.
        
        Returns:
            True if allowed, False if needs confirmation
        """
        if risk.risk_level == ToolPermissionLevel.SAFE:
            return True
        
        if risk.risk_level == ToolPermissionLevel.RESTRICTED:
            return False
        
        if risk.risk_level == ToolPermissionLevel.DANGEROUS:
            # Check if previously approved
            op_hash = self._hash_operation(risk.tool_name, risk.operation)
            return self.approved_operations.get(op_hash, False)
        
        # MODERATE - log but allow
        return True
    
    def request_permission(
        self,
        tool_name: str,
        operation: str,
        reason: str,
        risk: ToolRisk,
    ) -> PermissionRequest:
        """
        Create permission request for dangerous operation.
        
        Returns:
            PermissionRequest with request_id
        """
        from datetime import timedelta
        
        request_id = self._generate_request_id(tool_name, operation)
        
        perm_request = PermissionRequest(
            request_id=request_id,
            tool_name=tool_name,
            operation=operation,
            reason=reason,
            risk_assessment=risk,
            timestamp=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
        
        self.pending_requests[request_id] = perm_request
        return perm_request
    
    def respond_to_permission(
        self,
        request_id: str,
        approved: bool,
        reason: Optional[str] = None,
    ) -> PermissionResponse:
        """
        User responds to permission request.
        
        Args:
            request_id: Permission request ID
            approved: User approval decision
            reason: Optional reason for denial
        
        Returns:
            PermissionResponse
        
        Raises:
            ValueError if request not found or expired
        """
        if request_id not in self.pending_requests:
            raise ValueError(f"Permission request not found: {request_id}")
        
        perm_request = self.pending_requests[request_id]
        
        if datetime.utcnow() > perm_request.expires_at:
            del self.pending_requests[request_id]
            raise ValueError("Permission request expired")
        
        response = PermissionResponse(
            request_id=request_id,
            approved=approved,
            timestamp=datetime.utcnow(),
            reason=reason,
        )
        
        # Record decision
        if approved:
            op_hash = self._hash_operation(
                perm_request.tool_name,
                perm_request.operation,
            )
            self.approved_operations[op_hash] = True
        else:
            self.denied_operations.append(request_id)
        
        # Clean up
        del self.pending_requests[request_id]
        
        return response
    
    def _generate_request_id(self, tool_name: str, operation: str) -> str:
        """Generate unique request ID."""
        import uuid
        return str(uuid.uuid4())
    
    def _hash_operation(self, tool_name: str, operation: str) -> str:
        """Create hash of operation for caching approvals."""
        content = f"{tool_name}:{operation}"
        return hashlib.sha256(content.encode()).hexdigest()


# Global safety checker instance
safety_checker = SafetyChecker()
