from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime


from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCommentResponse, TaskUpdate, TaskBulkUpdate, TaskResponse, TaskComment, TaskCommentResponse, PaginationParams, TaskCreate
from app.schemas.auth import UserResponse, UserCreate
from app.core.database import get_db
from app.core.auth import get_current_user
from app.repositories.task import TaskRepository
from app.repositories.interfaces.task import AbstractTaskRepository

class TaskService:
    def __init__(self, repo):
        self.repo = repo

    async def create_task(self, task_data: TaskCreate, user_id: int) -> TaskResponse:
        new_task = await self.repo.create_task_in_db(task_data, user_id)
        return (await self.repo.enrich_tasks_with_usernames(tasks=[new_task]))[0]

    async def update_task(self, task_id: int, task_update: TaskUpdate, user_id: int) -> TaskResponse:
        task = await self.repo.update_task_in_db(task_id, task_update, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return (await self.repo.enrich_tasks_with_usernames(tasks=[task]))[0]
    
    async def list_tasks(self,
        pagination: PaginationParams = Depends(),
    ):
        tasks = await self.repo.get_all_tasks_in_db(skip=pagination.skip, limit=pagination.limit)
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found")
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks)
    
    async def bulk_update_tasks(self, task_update: TaskBulkUpdate, user_id: int) -> List[TaskResponse]:
        if not task_update.task_ids:
            raise HTTPException(status_code=400, detail="No task IDs provided")
        
        tasks = await self.repo.bulk_update_tasks_in_db(task_update.task_ids, task_update, user_id)
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found")
        
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks)
    
    async def get_tasks_created_by_user(self, user_id: int) -> List[TaskResponse]:
        tasks = await self.repo.get_tasks_created_by_specific_user_in_db(user_id)
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this user")
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks  )
    
    async def get_tasks_updated_by_user(self, user_id: int) -> List[TaskResponse]:
        tasks = await self.repo.get_tasks_updated_by_user_in_db(user_id)
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this user")
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks)
    
    async def get_tasks_assigned_to_user(self, user_id: int) -> List[TaskResponse]:
        tasks = await self.repo.get_tasks_assigned_to_user_in_db(user_id)
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this user")
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks)
    
    async def get_overdue_tasks(self) -> List[TaskResponse]:
        tasks = await self.repo.get_overdue_tasks_in_db()
        if not tasks:
            raise HTTPException(status_code=404, detail="No overdue tasks found")
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks)
    
    async def search_tasks_by_title(self, query: str, pagination: PaginationParams = Depends()) -> List[TaskResponse]:
        if not query:
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
        tasks = await self.repo.search_tasks_by_title_in_db(query, pagination.skip, pagination.limit)
        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found matching the search query")
        
        return await self.repo.enrich_tasks_with_usernames(tasks=tasks)
    
    async def get_task_by_id(self, task_id: int) -> TaskResponse:
        task = await self.repo.get_task_by_id_in_db(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return (await self.repo.enrich_tasks_with_usernames(tasks=[task]))[0]
    
    async def update_task_status(self, task_id: int, status: str, user_id: int) -> TaskResponse:
        if status not in ["pending", "in_progress", "completed", "cancelled", "on_hold"]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        
        task = await self.repo.update_task_status_in_db(task_id, status, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return (await self.repo.enrich_tasks_with_usernames(tasks=[task]))[0]
    
    
