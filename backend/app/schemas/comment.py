from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.auth import UserResponse

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

# Schema para la creación de comentarios (simple)
class TaskCommentCreate(BaseModel):
    content: str

# Schema para la respuesta de comentarios (enriquecido)
class TaskCommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    updated_at: datetime
    task_id: int
    # Instead of the user ID, we can include a full user response
    created_by_user: UserResponse 

    class Config:
        from_attributes = True