from datetime import datetime
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.task import Task


class TaskRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_task(self, data: dict) -> Task:
        now = datetime.utcnow()
        new_task = Task(
            title=data["title"],
            description=data["description"],
            status=data["status"],
            priority=data["priority"],
            due_date=data.get("due_date"),
            assigned_to=data.get("assigned_to"),
            created_by=data["user_id"],
            updated_by=data["user_id"],
            created_at=now,
            updated_at=now,
        )
        self.db.add(new_task)
        await self.db.commit()
        await self.db.refresh(new_task)
        return new_task

    async def get_task(self, task_id: int) -> Optional[Task]:
        return await self.db.get(Task, task_id)

    async def update_task(self, task: Task, updates: dict, user_id: int) -> Task:
        for key, value in updates.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)
        task.updated_by = user_id
        task.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def bulk_update_tasks(self, task_ids: List[int], updates: dict, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.id.in_(task_ids)))
        tasks = result.scalars().all()

        for task in tasks:
            for key, value in updates.items():
                if hasattr(task, key) and value is not None:
                    setattr(task, key, value)
            task.updated_by = user_id
            task.updated_at = datetime.utcnow()

        await self.db.commit()
        return tasks

    async def list_tasks(self, skip: int = 0, limit: int = 100) -> List[Task]:
        result = await self.db.execute(select(Task).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_tasks_by_user_field(self, field: str, user_id: int) -> List[Task]:
        if field not in ["created_by", "updated_by", "assigned_to"]:
            return []
        result = await self.db.execute(select(Task).where(getattr(Task, field) == user_id))
        return result.scalars().all()

    async def get_overdue_tasks(self) -> List[Task]:
        now = datetime.utcnow()
        result = await self.db.execute(
            select(Task).where(Task.due_date < now, Task.status != "completed")
        )
        return result.scalars().all()

    async def get_tasks_by_priority(self, priority: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.priority == priority))
        return result.scalars().all()

    async def search_tasks(self, query: str, skip: int = 0, limit: int = 100) -> List[Task]:
        result = await self.db.execute(
            select(Task)
            .where(Task.title.ilike(f"%{query}%"))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_tasks_created_by(self, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.created_by == user_id))
        return result.scalars().all()

    async def update_task_status(self, task: Task, status: str, user_id: int) -> Task:
        task.status = status
        task.updated_by = user_id
        task.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete_task(self, task: Task):
        await self.db.delete(task)
        await self.db.commit()
