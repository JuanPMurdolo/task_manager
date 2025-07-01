from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.comment import CommentService
from app.repositories.comment import CommentRepository
from app.repositories.task import TaskRepository
from app.core.database import get_db

def get_comment_service(db: AsyncSession = Depends(get_db)) -> CommentService:
    repo = CommentRepository(db)
    task_repo = TaskRepository(db)  # Assuming you need a task repository as well
    return CommentService(repo, task_repo)