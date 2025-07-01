from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.comment import TaskComment, TaskCommentResponse
from app.services.comment import CommentService
from app.dependencies.comment import get_comment_service
from app.core.auth import get_current_user
from app.services.task import TaskService
from app.dependencies.task import get_task_service

router = APIRouter()


@router.post("/tasks/{task_id}/comments", response_model=TaskCommentResponse)
async def add_task_comment(
    task_id: int,
    comment_data: TaskComment,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Add a comment to a task.
    Args:
        task_id (int): The ID of the task to which the comment is added.
        comment_data (TaskComment): The comment data containing the content of the comment.
        db (AsyncSession): Database session dependency.
        current_user (User): The user making the request, used for auditing.
    Returns:
        TaskCommentResponse: The added comment with enriched user information.
    Raises:
        HTTPException: If the task is not found or if the comment creation fails.
    """
    return await service.add_comment_to_task(task_id, comment_data, current_user.id)

@router.get("/tasks/{task_id}/comments", response_model=List[TaskCommentResponse])
async def get_task_comments(
    task_id: int,
    service: CommentService = Depends(get_comment_service),
):
    """
    Get all comments for a specific task.
    Args:
        task_id (int): The ID of the task for which comments are retrieved.
        db (AsyncSession): Database session dependency.
    Returns:
        List[TaskCommentResponse]: A list of comments for the specified task with enriched user information.
    Raises:
        HTTPException: If the task is not found or if no comments are found.
    """
    comments = await service.get_comments_for_task(task_id)
    if not comments:
        raise HTTPException(status_code=404, detail="No comments found for this task")
    return comments

@router.delete("/tasks/{task_id}/comments/{comment_id}", response_model=TaskCommentResponse)
async def delete_task_comment(
    task_id: int,
    comment_id: int,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment from a task.
    Args:
        task_id (int): The ID of the task from which the comment is deleted.
        comment_id (int): The ID of the comment to delete.
        db (AsyncSession): Database session dependency.
        current_user (User): The user making the request, used for auditing.
    Returns:
        TaskCommentResponse: The deleted comment with enriched user information.
    Raises:
        HTTPException: If the task or comment is not found or if the deletion fails.
    """
    comment = await service.get_comment_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.created_by_user.username != current_user.username and current_user.type != "admin":
        print(comment)
        raise HTTPException(status_code=403, detail="You do not have permission to delete this comment")
    return await service.delete_comment_from_task(task_id, comment_id)
