from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "low"
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str  # e.g., low, medium, high, urgent
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: str  # Username of the creator
    updated_by: Optional[str]  #  Username of the last updater
    assigned_to: Optional[str]  #   Username of the assignee


    class Config:
        from_attributes = True
        
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "low"  # e.g., low, medium, high, urgent
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    updated_by: Optional[int] = None

class TaskBulkUpdate(BaseModel):
    task_ids: List[int]
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    updated_by: Optional[int] = None
    
class TaskStatus(str):
    status: Optional[str] = "Pending"

class PaginationParams(BaseModel):
    page: int = 1
    skip: int = 0
    size: int = 10
    limit: Optional[int] = None
