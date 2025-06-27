from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskBulkUpdate


async def create_task_in_db(db: AsyncSession, task_data: TaskCreate, user_id: int) -> Task:
    now = datetime.utcnow()
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        assigned_to=task_data.assigned_to,
        created_by=user_id,
        updated_by=user_id,
        created_at=now,
        updated_at=now,
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


async def update_task_in_db(db: AsyncSession, task_id: int, update_data: TaskUpdate, user_id: int) -> Optional[Task]:
    task = await db.get(Task, task_id)
    if not task:
        return None

    if update_data.status is not None:
        task.status = update_data.status
    if update_data.assigned_to is not None:
        task.assigned_to = update_data.assigned_to
    if update_data.priority is not None:
        task.priority = update_data.priority
    if update_data.due_date is not None:
        task.due_date = update_data.due_date

    task.updated_by = user_id
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)
    return task


async def bulk_update_tasks_in_db(db: AsyncSession, task_ids: List[int], update_data: TaskBulkUpdate, user_id: int) -> List[Task]:
    result = await db.execute(select(Task).where(Task.id.in_(task_ids)))
    tasks = result.scalars().all()

    for task in tasks:
        if update_data.status is not None:
            task.status = update_data.status
        if update_data.assigned_to is not None:
            task.assigned_to = update_data.assigned_to
        if update_data.priority is not None:
            task.priority = update_data.priority
        if update_data.due_date is not None:
            task.due_date = update_data.due_date

        task.updated_by = user_id
        task.updated_at = datetime.utcnow()

    await db.commit()
    return tasks


async def get_all_tasks(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Task]:
    result = await db.execute(select(Task).offset(skip).limit(limit))
    return result.scalars().all()


async def get_task_by_id(db: AsyncSession, task_id: int) -> Optional[Task]:
    return await db.get(Task, task_id)


async def get_tasks_created_by_user(db: AsyncSession, user_id: int) -> List[Task]:
    result = await db.execute(select(Task).where(Task.created_by == user_id))
    return result.scalars().all()


async def get_tasks_updated_by_user(db: AsyncSession, user_id: int) -> List[Task]:
    result = await db.execute(select(Task).where(Task.updated_by == user_id))
    return result.scalars().all()


async def get_tasks_assigned_to_user(db: AsyncSession, user_id: int) -> List[Task]:
    result = await db.execute(select(Task).where(Task.assigned_to == user_id))
    return result.scalars().all()


async def get_overdue_tasks(db: AsyncSession) -> List[Task]:
    now = datetime.utcnow()
    result = await db.execute(select(Task).where(Task.due_date < now, Task.status != "completed"))
    return result.scalars().all()


async def get_tasks_by_priority(db: AsyncSession, priority: int) -> List[Task]:
    result = await db.execute(select(Task).where(Task.priority == priority))
    return result.scalars().all()


async def search_tasks_by_title(db: AsyncSession, query: str, skip: int = 0, limit: int = 100) -> List[Task]:
    result = await db.execute(
        select(Task).where(Task.title.ilike(f"%{query}%")).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def update_task_status_in_db(db: AsyncSession, task_id: int, status: str, user_id: int) -> Optional[Task]:
    task = await db.get(Task, task_id)
    if not task:
        return None

    task.status = status
    task.updated_by = user_id
    task.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(task)
    return task