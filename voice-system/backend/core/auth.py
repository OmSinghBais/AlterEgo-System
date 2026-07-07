"""
JWT Authentication for AlterEGO Backend
Provides token generation, validation, and user context management.
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from pydantic import BaseModel
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base
from passlib.context import CryptContext

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Security context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
Base = declarative_base()


class User(Base):
    """User model for database persistence."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class TokenData(BaseModel):
    """Token payload structure."""
    sub: str  # user_id
    exp: datetime
    iat: datetime
    type: str  # "access" or "refresh"


class TokenResponse(BaseModel):
    """Token response structure."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserContext(BaseModel):
    """User context attached to requests."""
    user_id: str
    username: str
    email: str
    is_active: bool


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_token(user_id: str, token_type: str = "access") -> str:
    """
    Create JWT token.
    
    Args:
        user_id: User identifier
        token_type: "access" or "refresh"
    
    Returns:
        JWT token string
    """
    now = datetime.utcnow()
    
    if token_type == "access":
        expires = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    elif token_type == "refresh":
        expires = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    else:
        raise ValueError(f"Invalid token type: {token_type}")
    
    payload = {
        "sub": user_id,
        "type": token_type,
        "iat": now,
        "exp": expires,
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verify_token(token: str) -> TokenData:
    """
    Verify and decode JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        TokenData with user_id and expiration
    
    Raises:
        HTTPException if token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(
            sub=user_id,
            type=token_type,
            iat=datetime.fromtimestamp(payload["iat"]),
            exp=datetime.fromtimestamp(payload["exp"]),
        )
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> UserContext:
    """
    Dependency for protecting routes.
    Extract and validate user from JWT token.
    
    Usage:
        @app.get("/protected")
        async def protected_route(user: UserContext = Depends(get_current_user)):
            return {"user_id": user.user_id}
    """
    token = credentials.credentials
    token_data = verify_token(token)
    
    # In production, fetch user from database
    # For now, return basic context
    return UserContext(
        user_id=token_data.sub,
        username=token_data.sub,  # In production: query database
        email=f"{token_data.sub}@alterego.ai",  # In production: query database
        is_active=True,
    )


async def get_optional_user(request) -> Optional[UserContext]:
    """
    Optional authentication - doesn't fail if no token provided.
    Useful for endpoints that work with or without auth.
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        return None
    
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            return None
        
        token_data = verify_token(token)
        return UserContext(
            user_id=token_data.sub,
            username=token_data.sub,
            email=f"{token_data.sub}@alterego.ai",
            is_active=True,
        )
    except Exception:
        return None
