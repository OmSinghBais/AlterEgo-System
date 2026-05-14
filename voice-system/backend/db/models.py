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
    feedback = Column(Integer) # 1 for positive, -1 for negative

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

class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    pattern = Column(String) # e.g. "morning_routine"
    frequency = Column(Integer, default=1)
    last_triggered = Column(Float)

class SuccessfulWorkflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    goal = Column(String, nullable=False)
    plan_json = Column(Text, nullable=False) # The JSON plan that worked
    success_count = Column(Integer, default=1)

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="active") # active, completed, abandoned
    progress = Column(Float, default=0.0)
    deadline = Column(Float)
    created_at = Column(Float, default=func.now())
    updated_at = Column(Float, default=func.now())
    metadata_json = Column(Text) # JSON for tracking sub-tasks/gap analysis
