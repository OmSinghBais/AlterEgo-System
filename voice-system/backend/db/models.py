from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(Float, default=func.now())
    importance = Column(Float, default=0.5)

class LongTermMemory(Base):
    __tablename__ = "long_term"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    category = Column(String, default="general")
    importance = Column(Float, default=0.5)
    access_count = Column(Integer, default=0)
    created_at = Column(Float, default=func.now())
    last_accessed = Column(Float)
    embedding = Column(Text) # JSON string of vector

class UserFact(Base):
    __tablename__ = "user_facts"
    key = Column(String, primary_key=True, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(Float, default=func.now())

class SystemEvent(Base):
    __tablename__ = "system_events"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False)
    data = Column(Text)
    timestamp = Column(Float, default=func.now())
