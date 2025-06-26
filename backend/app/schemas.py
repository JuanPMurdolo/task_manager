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
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    created_by: str  # nombre de usuario
    updated_by: Optional[str]  # nombre de usuario
    assigned_to: Optional[str]  # nombre de usuario o None


    class Config:
        from_attributes = True
        
class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]
    priority: Optional[str]
    due_date: Optional[datetime]
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

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str
    type: Optional[str] = None  # e.g., "admin", "user"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    type: Optional[str] = None  # e.g., "admin", "user"

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TaskComment(BaseModel):
    task_id: int
    user_id: int
    content: str
    created_at: Optional[datetime] = None

class TaskCommentResponse(TaskComment):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
