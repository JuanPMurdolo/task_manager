from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.task import TaskService
from app.repositories.task import TaskRepository
from app.core.database import get_db

def get_task_service(db: AsyncSession = Depends(get_db)) -> TaskService:
    repo = TaskRepository(db)
    return TaskService(repo)