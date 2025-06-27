from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default='pending')  # pending, hold, in_progress, completed, cancelled
    priority = Column(String, default="low")  # low, medium, high, urgent
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    comments = Column(String, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"))
    updated_by = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))

    # Relaciones bidireccionales
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[created_by])
    updater = relationship("User", back_populates="tasks_updated", foreign_keys=[updated_by])
    assignee = relationship("User", back_populates="tasks_assigned", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"