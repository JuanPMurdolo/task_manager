from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default='pending')  # e.g., pending, in_progress, completed
    priority = Column(String, default="low")  # e.g., low, medium, high, urgent
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    assigned_to = Column(Integer, ForeignKey('users.id'), nullable=True)
    updated_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    due_date = Column(DateTime, nullable=True)
    comments = Column(String, nullable=True)  # Optional field for task comments

    # Relaciones bidireccionales
    creator = relationship("User", foreign_keys=[created_by], back_populates="tasks_created")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="task_assigned")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relaciones bidireccionales
    tasks_created = relationship('Task', foreign_keys=[Task.created_by], back_populates='creator')
    task_assigned = relationship('Task', foreign_keys=[Task.assigned_to], back_populates='assignee')
