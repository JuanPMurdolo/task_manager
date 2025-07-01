from fastapi import HTTPException
from typing import List
from app.repositories.interfaces.comment import AbstractCommentRepository
from app.schemas.comment import TaskComment, TaskCommentResponse
class CommentService:

    def __init__(self, repo: AbstractCommentRepository, task_repo: AbstractCommentRepository):
        self.repo = repo
        self.task_repo = task_repo
    
    async def get_comment_by_id(self, comment_id: int) -> TaskCommentResponse:
        comment = await self.repo.get_comment_by_id_in_db(comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        return TaskCommentResponse.from_orm(comment)

    async def get_comments_for_task(self, task_id: int) -> List[TaskCommentResponse]:
        task = await self.task_repo.get_task_by_id_in_db(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        comments = await self.repo.get_comments_for_task_in_db(task_id)
        return [TaskCommentResponse.from_orm(comment) for comment in comments]

    async def add_comment_to_task(self, task_id: int, comment_data: TaskComment, user_id: int) -> TaskCommentResponse:
        task = await self.task_repo.get_task_by_id_in_db(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        new_comment = await self.repo.add_comment_to_task_in_db(task_id, comment_data, user_id)
        return TaskCommentResponse.from_orm(new_comment)

    async def delete_comment_from_task(self, task_id: int, comment_id: int) -> TaskCommentResponse:
        task = await self.task_repo.get_task_by_id_in_db(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        comment = await self.repo.delete_comment_from_task_in_db(comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        return TaskCommentResponse.from_orm(comment)
    