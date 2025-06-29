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
from app.repositories.task import enrich_tasks_with_usernames, create_task_in_db, update_task_in_db, bulk_update_tasks_in_db, get_all_tasks_in_db, \
    get_tasks_created_by_user_in_db, get_tasks_updated_by_user_in_db, get_tasks_assigned_to_user_in_db, get_overdue_tasks_in_db, \
    get_tasks_by_priority_in_db, search_tasks_by_title_in_db, update_task_status_in_db, get_task_by_id_in_db


async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = await create_task_in_db(db, task_data, current_user.id)
    return (await enrich_tasks_with_usernames([new_task], db))[0]

async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await update_task_in_db(db, task_id, task_update, current_user.id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return (await enrich_tasks_with_usernames([task], db))[0]

async def bulk_update_tasks(
    task_update: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not task_update.task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")

    tasks = await bulk_update_tasks_in_db(db, task_update.task_ids, task_update, current_user.id)

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")

    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    tasks = await get_all_tasks_in_db(db, skip=pagination.skip, limit=pagination.limit)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/created", response_model=List[TaskResponse])
async def get_created_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tasks = await get_tasks_created_by_user_in_db(db, current_user.id)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/updated", response_model=List[TaskResponse])
async def get_updated_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tasks = await get_tasks_updated_by_user_in_db(db, current_user.id)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/assigned", response_model=List[TaskResponse])
async def get_assigned_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    tasks = await get_tasks_assigned_to_user_in_db(db, current_user.id)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks_endpoint(
    db: AsyncSession = Depends(get_db)
):
    tasks = await get_overdue_tasks_in_db(db)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/priority/{priority}", response_model=List[TaskResponse])
async def get_tasks_by_priority_endpoint(
    priority: int,
    db: AsyncSession = Depends(get_db)
):
    if priority < 1 or priority > 5:
        raise HTTPException(status_code=400, detail="Priority must be between 1 and 5")

    tasks = await get_tasks_by_priority_in_db(db, priority)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/search", response_model=List[TaskResponse])
async def search_tasks(
    query: str,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends()
):
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    tasks = await search_tasks_by_title_in_db(db, query, pagination.skip, pagination.limit)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/created_by/{user_id}", response_model=List[TaskResponse])
async def get_tasks_created_by_user_route(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    tasks = await get_tasks_created_by_user_in_db(db, user_id)
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    task = await get_task_by_id_in_db(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return (await enrich_tasks_with_usernames([task], db))[0]

@router.put("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        task = await update_task_status_in_db(db, task_id, status, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return (await enrich_tasks_with_usernames([task], db))[0]