from typing import List, Optional
from datetime import datetime

from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.task import Task
from app.models.comments import Comment
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate, TaskBulkUpdate, TaskCommentCreate, TaskCommentResponse
from app.schemas.auth import UserResponse
from sqlalchemy.orm import selectinload
from app.repositories.interfaces.task import AbstractTaskRepository

class TaskRepository(AbstractTaskRepository):
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def enrich_tasks_with_usernames(self, tasks: list[Task]) -> list[TaskResponse]:
        user_ids = set()
        for task in tasks:
            if task.created_by:
                user_ids.add(task.created_by)
            if task.updated_by:
                user_ids.add(task.updated_by)
            if task.assigned_to:
                user_ids.add(task.assigned_to)

        result = await self.db.execute(select(User).where(User.id.in_(user_ids)))
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

    async def create_task_in_db(self, task_data: TaskCreate, user_id: int) -> Task:
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
        self.db.add(new_task)
        await self.db.commit()
        await self.db.refresh(new_task)
        return new_task


    async def update_task_in_db(self, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[Task]:
        task = await self.db.get(Task, task_id)
        if not task:
            return None

        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.status is not None:
            task.status = task_data.status
        if task_data.priority is not None:
            task.priority = task_data.priority
        if task_data.due_date is not None:
            task.due_date = task_data.due_date
        if task_data.assigned_to is not None:
            task.assigned_to = task_data.assigned_to

        task.updated_by = user_id
        task.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(task)
        return task


    async def bulk_update_tasks_in_db(self, task_ids: List[int], update_data: TaskBulkUpdate, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.id.in_(task_ids)))
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

        await self.db.commit()
        return tasks


    async def get_all_tasks_in_db(self, skip: int = 0, limit: int = 100) -> List[Task]:
        result = await self.db.execute(select(Task).offset(skip).limit(limit))
        return result.scalars().all()


    async def get_task_by_id_in_db(self, task_id: int) -> Optional[Task]:
        return await self.db.get(Task, task_id)


    async def get_tasks_created_by_user_in_db(self, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.created_by == user_id))
        return result.scalars().all()


    async def get_tasks_updated_by_user_in_db(self, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.updated_by == user_id))
        return result.scalars().all()


    async def get_tasks_assigned_to_user_in_db(self, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.assigned_to == user_id))
        return result.scalars().all()


    async def get_overdue_tasks_in_db(self) -> List[Task]:
        now = datetime.utcnow()
        result = await self.db.execute(select(Task).where(Task.due_date < now, Task.status != "completed"))
        return result.scalars().all()


    async def get_tasks_by_priority_in_db(self, priority: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.priority == priority))
        return result.scalars().all()


    async def search_tasks_by_title_in_db(self, query: str, skip: int = 0, limit: int = 100) -> List[Task]:
        result = await self.db.execute(
            select(Task).where(Task.title.ilike(f"%{query}%")).offset(skip).limit(limit)
        )
        return result.scalars().all()


    async def get_tasks_created_by_specific_user_in_db(self, user_id: int) -> List[Task]:
        result = await self.db.execute(select(Task).where(Task.created_by == user_id))
        return result.scalars().all()


    async def update_task_status_in_db(self, task_id: int, status: str, user_id: int) -> Optional[Task]:
        task = await self.db.get(Task, task_id)
        if not task:
            return None

        task.status = status
        task.updated_by = user_id
        task.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete_task_in_db(self, task_id: int) -> Optional[Task]:
        task = await self.db.get(Task, task_id)
        if not task:
            return None

        await self.db.delete(task)
        await self.db.commit()
        return task

    async def get_comments_for_task_in_db(self, task_id: int) -> List[TaskCommentResponse]:
        result = await self.db.execute(
            select(Comment)
            .where(Comment.task_id == task_id)
            .options(selectinload(Comment.created_by_user))
        )
        comments = result.scalars().all()
        return [TaskCommentResponse.from_orm(comment) for comment in comments]

    async def add_comment_to_task_in_db(self, task_id: int, comment_data: TaskCommentCreate, user_id: int) -> Comment:
        new_comment = Comment(
            content=comment_data.content,
            task_id=task_id,
            user_id=user_id
        )
        self.db.add(new_comment)
        await self.db.commit()
        await self.db.refresh(new_comment)

        result = await self.db.execute(
            select(Comment)
            .where(Comment.id == new_comment.id)
            .options(selectinload(Comment.created_by_user))
        )
        return result.scalar_one()

    async def delete_comment_from_task_in_db(self, comment_id: int) -> Optional[Comment]:
        comment = await self.db.get(Comment, comment_id, options=[selectinload(Comment.created_by_user)])
        if not comment:
            return None
        
        deleted_comment_data = TaskCommentResponse.from_orm(comment)
        
        await self.db.delete(comment)
        await self.db.commit()
        
        return deleted_comment_data