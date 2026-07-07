"""
Unified API Response & Error Handling for AlterEGO
Consistent response formatting and comprehensive error handling.
"""
from typing import Optional, Any, Dict, Generic, TypeVar, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum
from fastapi import HTTPException, status
import traceback
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T')


class ErrorSeverity(str, Enum):
    """Error severity levels."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class ErrorDetail(BaseModel):
    """Detailed error information."""
    code: str
    message: str
    severity: ErrorSeverity
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    trace_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None


class APIResponse(BaseModel, Generic[T]):
    """
    Unified API response wrapper.
    
    Usage:
        return APIResponse(data=result, message="Success")
    """
    success: bool
    data: Optional[T] = None
    message: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    trace_id: Optional[str] = None
    error: Optional[ErrorDetail] = None
    
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    @classmethod
    def success_response(cls, data: T, message: str = "Success", trace_id: str = None) -> "APIResponse[T]":
        """Create successful response."""
        return cls(
            success=True,
            data=data,
            message=message,
            trace_id=trace_id,
        )
    
    @classmethod
    def error_response(
        cls,
        error_detail: ErrorDetail,
        message: str = "Request failed",
        trace_id: str = None,
    ) -> "APIResponse[T]":
        """Create error response."""
        return cls(
            success=False,
            data=None,
            message=message,
            trace_id=trace_id,
            error=error_detail,
        )


class APIException(HTTPException):
    """Base exception for API errors."""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        severity: ErrorSeverity = ErrorSeverity.ERROR,
        context: Optional[Dict[str, Any]] = None,
        suggestions: Optional[List[str]] = None,
        trace_id: Optional[str] = None,
    ):
        self.code = code
        self.error_detail = ErrorDetail(
            code=code,
            message=message,
            severity=severity,
            context=context,
            suggestions=suggestions,
            trace_id=trace_id,
        )
        super().__init__(status_code=status_code, detail=message)


class ValidationError(APIException):
    """Invalid input parameters."""
    def __init__(self, message: str, context: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            severity=ErrorSeverity.WARNING,
            context=context,
            suggestions=["Check your input parameters", "Review API documentation"],
        )


class AuthenticationError(APIException):
    """Authentication failed."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            code="AUTH_FAILED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            severity=ErrorSeverity.WARNING,
            suggestions=["Provide valid authentication token", "Login and try again"],
        )


class PermissionError(APIException):
    """User lacks permission for operation."""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            code="PERMISSION_DENIED",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            severity=ErrorSeverity.WARNING,
            suggestions=["Request elevated permissions", "Contact administrator"],
        )


class NotFoundError(APIException):
    """Resource not found."""
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource} not found: {identifier}",
            status_code=status.HTTP_404_NOT_FOUND,
            severity=ErrorSeverity.INFO,
        )


class ConflictError(APIException):
    """Resource conflict."""
    def __init__(self, message: str):
        super().__init__(
            code="CONFLICT",
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            severity=ErrorSeverity.WARNING,
        )


class RateLimitError(APIException):
    """Rate limit exceeded."""
    def __init__(self, retry_after: int = 60):
        super().__init__(
            code="RATE_LIMIT_EXCEEDED",
            message=f"Rate limit exceeded. Retry after {retry_after}s",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            severity=ErrorSeverity.WARNING,
            context={"retry_after": retry_after},
        )


class InternalServerError(APIException):
    """Internal server error."""
    def __init__(self, message: str = "Internal server error", trace_id: str = None):
        super().__init__(
            code="INTERNAL_ERROR",
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            severity=ErrorSeverity.CRITICAL,
            suggestions=["Contact support if problem persists", f"Reference trace ID: {trace_id}"],
            trace_id=trace_id,
        )


class ToolExecutionError(APIException):
    """Tool execution failed."""
    def __init__(self, tool_name: str, message: str, context: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="TOOL_EXECUTION_FAILED",
            message=f"Tool '{tool_name}' failed: {message}",
            status_code=status.HTTP_400_BAD_REQUEST,
            severity=ErrorSeverity.ERROR,
            context={**(context or {}), "tool": tool_name},
            suggestions=["Check tool parameters", "Verify system permissions", "Review logs"],
        )


# Common Request/Response Models

class ChatMessage(BaseModel):
    """Chat message schema."""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=10000)
    timestamp: Optional[datetime] = None
    
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


class ChatRequest(BaseModel):
    """Chat request schema."""
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(validate_assignment=True)


class ChatResponse(BaseModel):
    """Chat response schema."""
    response: str
    conversation_id: str
    reasoning: Optional[str] = None
    tools_used: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


class ToolCall(BaseModel):
    """Tool call request."""
    tool_name: str = Field(..., min_length=1)
    operation: str = Field(..., min_length=1)
    parameters: Dict[str, Any] = Field(default_factory=dict)
    reason: str = Field(default="")
    
    model_config = ConfigDict(validate_assignment=True)


class ToolResponse(BaseModel):
    """Tool execution response."""
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None
    tool_name: str
    operation: str
    execution_time: float  # seconds


class HealthStatus(BaseModel):
    """System health status."""
    status: str = Field(..., pattern="^(healthy|degraded|unhealthy)$")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    components: Dict[str, str]  # component -> status
    uptime_seconds: int
    version: str


# Error Handler Functions

def handle_validation_error(errors: List[Dict[str, Any]]) -> APIException:
    """Convert Pydantic validation errors to APIException."""
    error_messages = []
    for error in errors:
        field = ".".join(str(x) for x in error.get("loc", []))
        msg = error.get("msg", "Invalid value")
        error_messages.append(f"{field}: {msg}")
    
    return ValidationError(
        message="; ".join(error_messages),
        context={"errors": errors},
    )


def handle_exception(exc: Exception, trace_id: str = None) -> APIResponse:
    """Convert generic exception to API response."""
    error_type = type(exc).__name__
    message = str(exc)
    
    logger.error(f"Exception [{trace_id}]: {error_type} - {message}")
    logger.error(traceback.format_exc())
    
    error = ErrorDetail(
        code=error_type,
        message=message,
        severity=ErrorSeverity.CRITICAL,
        trace_id=trace_id,
        suggestions=["Check system logs", "Contact support"],
    )
    
    return APIResponse.error_response(
        error,
        message="An unexpected error occurred",
        trace_id=trace_id,
    )
