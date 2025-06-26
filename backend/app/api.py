from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import datetime

from app.models import Task, User
from app.schemas import TaskCommentResponse, TaskUpdate
from app.database import get_db
from app.schemas import (
    TaskBulkUpdate, TaskResponse, TaskComment, TaskCommentResponse,
    PaginationParams, TaskCreate
)
from app.auth import get_current_user

router = APIRouter()

async def enrich_tasks_with_usernames(tasks: list[Task], db: AsyncSession) -> list[TaskResponse]:
    user_ids = set()
    for task in tasks:
        if task.created_by:
            user_ids.add(task.created_by)
        if task.updated_by:
            user_ids.add(task.updated_by)
        if task.assigned_to:
            user_ids.add(task.assigned_to)

    result = await db.execute(select(User).where(User.id.in_(user_ids)))
    user_map = {user.id: user.username for user in result.scalars().all()}

    return [
        TaskResponse(
            id=t.id,
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            due_date=t.due_date,
            created_at=t.created_at,
            updated_at=t.updated_at,
            created_by=user_map.get(t.created_by, "Desconocido"),
            updated_by=user_map.get(t.updated_by, "Desconocido"),
            assigned_to=user_map.get(t.assigned_to, "Desconocido") if t.assigned_to else None
        )
        for t in tasks
    ]

@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.utcnow()
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        assigned_to=task_data.assigned_to,
        created_by=current_user.id,
        updated_by=current_user.id,
        created_at=now,
        updated_at=now,
    )

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    return (await enrich_tasks_with_usernames([new_task], db))[0]

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.status is not None:
        task.status = task_update.status
    if task_update.assigned_to is not None:
        task.assigned_to = task_update.assigned_to
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.due_date is not None:
        task.due_date = task_update.due_date

    task.updated_by = current_user.id
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)
    return (await enrich_tasks_with_usernames([task], db))[0]

@router.post("/tasks/bulk_update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    task_update: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not task_update.task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")

    result = await db.execute(select(Task).where(Task.id.in_(task_update.task_ids)))
    tasks = result.scalars().all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")

    for task in tasks:
        if task_update.status is not None:
            task.status = task_update.status
        if task_update.assigned_to is not None:
            task.assigned_to = task_update.assigned_to
        if task_update.priority is not None:
            task.priority = task_update.priority
        if task_update.due_date is not None:
            task.due_date = task_update.due_date

        task.updated_by = current_user.id
        task.updated_at = datetime.utcnow()

    await db.commit()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    query = select(Task).offset(pagination.skip).limit(pagination.limit)
    result = await db.execute(query)
    tasks = result.scalars().all()
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/created", response_model=List[TaskResponse])
async def get_created_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(Task.created_by == current_user.id))
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/updated", response_model=List[TaskResponse])
async def get_updated_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(Task.updated_by == current_user.id))
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/assigned", response_model=List[TaskResponse])
async def get_assigned_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(Task.assigned_to == current_user.id))
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks(
    db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    result = await db.execute(select(Task).where(Task.due_date < now, Task.status != 'completed'))
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/priority/{priority}", response_model=List[TaskResponse])
async def get_tasks_by_priority(
    priority: int,
    db: AsyncSession = Depends(get_db)
):
    if priority < 1 or priority > 5:
        raise HTTPException(status_code=400, detail="Priority must be between 1 and 5")

    result = await db.execute(select(Task).where(Task.priority == priority))
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/search", response_model=List[TaskResponse])
async def search_tasks(
    query: str,
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends()
):
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    result = await db.execute(
        select(Task).where(Task.title.ilike(f"%{query}%")).offset(pagination.skip).limit(pagination.limit)
    )
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/created_by/{user_id}", response_model=List[TaskResponse])
async def get_tasks_created_by_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Task).where(Task.created_by == user_id))
    tasks = result.scalars().all()
    return await enrich_tasks_with_usernames(tasks, db)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return (await enrich_tasks_with_usernames([task], db))[0]
