from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    type = Column(String, default="user")  # e.g., "admin", "user"
    created_at = Column(DateTime, server_default=func.now())

    # Relaciones bidireccionales con Task
    tasks_created = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    tasks_updated = relationship("Task", back_populates="updater", foreign_keys="Task.updated_by")
    tasks_assigned = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
