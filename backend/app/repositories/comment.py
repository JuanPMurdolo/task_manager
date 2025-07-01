
from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.comment import Comment
from app.schemas.comment import TaskCommentCreate, TaskCommentResponse
from app.repositories.interfaces.comment import AbstractCommentRepository
from app.models.user import User

class CommentRepository(AbstractCommentRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def enrich_comments_with_usernames(self, comments: List[Comment]) -> List[TaskCommentResponse]:
        user_ids = {comment.user_id for comment in comments if comment.user_id}
        result = await self.db.execute(select(User).where(User.id.in_(user_ids)))
        user_map = {user.id: user.username for user in result.scalars().all()}

        return [
            TaskCommentResponse(
                id=comment.id,
                content=comment.content,
                created_at=comment.created_at,
                created_by_user=user_map.get(comment.user_id, "Desconocido")
            )
            for comment in comments
        ]

    async def get_comments_for_task_in_db(self, task_id: int) -> List[TaskCommentResponse]:
            result = await self.db.execute(
                select(Comment)
                .where(Comment.task_id == task_id)
                .options(selectinload(Comment.created_by_user))
            )
            comments = result.scalars().all()
            return [TaskCommentResponse.from_orm(comment) for comment in comments]

    async def get_comment_by_id_in_db(self, comment_id: int) -> Optional[Comment]:
        result = await self.db.execute(
            select(Comment)
            .where(Comment.id == comment_id)
            .options(selectinload(Comment.created_by_user))
        )
        return result.scalar_one_or_none()

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