from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime


from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCommentResponse, TaskUpdate, TaskBulkUpdate, TaskResponse, TaskComment, TaskCommentResponse, PaginationParams, TaskCreate
from app.schemas.user import UserResponse, UserCreate
from app.core.database import get_db
from app.core.auth import get_current_user
from app.repositories.task import TaskRepository
from app.repositories.interfaces.task import AbstractTaskRepository

router = APIRouter()


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    new_task = await repo.create_task_in_db(db, task_data, current_user.id)
    return (await repo.enrich_tasks_with_usernames(tasks=[new_task]))[0]

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    task = await repo.update_task_in_db(db, task_id, task_update, current_user.id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return (await repo.enrich_tasks_with_usernames(tasks=[task]))[0]

@router.post("/tasks/bulk_update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    task_update: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    if not task_update.task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")

    tasks = await repo.bulk_update_tasks_in_db(db, task_update.task_ids, task_update, current_user.id)

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")

    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    tasks = await repo.get_all_tasks_in_db(skip=pagination.skip, limit=pagination.limit)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/created", response_model=List[TaskResponse])
async def get_created_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    tasks = await repo.get_tasks_created_by_user_in_db(db, current_user.id)
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/updated", response_model=List[TaskResponse])
async def get_updated_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    tasks = await repo.get_tasks_updated_by_user_in_db(db, current_user.id)
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/assigned", response_model=List[TaskResponse])
async def get_assigned_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    tasks = await repo.get_tasks_assigned_to_user_in_db(db, current_user.id)
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks_endpoint(
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    tasks = await repo.get_overdue_tasks_in_db(db)
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/search", response_model=List[TaskResponse])
async def search_tasks(
    query: str,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends()
):
    repo = TaskRepository(db)
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    tasks = await repo.search_tasks_by_title_in_db(db, query, pagination.skip, pagination.limit)
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/created_by/{user_id}", response_model=List[TaskResponse])
async def get_tasks_created_by_user_route(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    tasks = await repo.get_tasks_created_by_user_in_db(db, user_id)
    return await repo.enrich_tasks_with_usernames(tasks=tasks)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    repo = TaskRepository(db)
    task = await repo.get_task_by_id_in_db(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return (await repo.enrich_tasks_with_usernames(tasks=[task]))[0]

@router.put("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    try:
        task = await repo.update_task_status_in_db(db, task_id, status, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return (await repo.enrich_tasks_with_usernames(tasks=[task]))[0]