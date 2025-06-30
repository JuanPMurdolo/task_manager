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
from app.services.task import TaskService
from app.dependencies.task import get_task_service

router = APIRouter()


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task with the provided data.
    Args:
        task_data (TaskCreate): The data for the new task.
        db (AsyncSession): Database session dependency.
        current_user (User): The user creating the task, used for auditing.
    Returns:
        TaskResponse: The created task with enriched user information.
    Raises:
        HTTPException: If the task creation fails or if the user is not authenticated.
    """
    new_task = await service.create_task(task_data, current_user.id)
    return new_task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing task by its ID.
    Args:
        task_id (int): The ID of the task to update.
        task_update (TaskUpdate): The update data containing fields to update.
        db (AsyncSession): Database session dependency.
        current_user (User): The user making the request, used for auditing.
    Returns:
        TaskResponse: The updated task.
    Raises:
        HTTPException: If the task is not found or if the update fails.
    """
    task = await service.update_task(task_id, task_update, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/tasks/bulk_update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    task_update: TaskBulkUpdate,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Bulk update tasks based on the provided task IDs and update data.
    Args:
        task_update (TaskBulkUpdate): The bulk update data containing task IDs and fields to update.
        db (AsyncSession): Database session dependency.
        current_user (User): The user making the request, used for auditing.
    Returns:
        List[TaskResponse]: A list of updated tasks.
    Raises:
        HTTPException: If no task IDs are provided or if no tasks are found.
    """
    if not task_update.task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")
    tasks = await service.bulk_update_tasks(task_update.task_ids, task_update, current_user.id)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return await tasks

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    pagination: PaginationParams = Depends(),
    service: TaskService = Depends(get_task_service)
):
    """
    List all tasks with pagination support.
    
    Args:
        pagination (PaginationParams): Pagination parameters for the request.
        db (AsyncSession): Database session dependency.
    """
    tasks = await service.list_tasks(pagination=pagination)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return tasks
    

@router.get("/tasks/created", response_model=List[TaskResponse])
async def get_created_tasks(
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """
    Get tasks created by the current user.
    Args:
        current_user (User): The user making the request, used for auditing.
        db (AsyncSession): Database session dependency.
    Returns:
        List[TaskResponse]: A list of tasks created by the user.
    Raises:
        HTTPException: If no tasks are found for the user.
    """
    service: TaskService = Depends(get_task_service),
    tasks = await service.get_tasks_created_by_user(current_user.id)
    return tasks

@router.get("/tasks/updated", response_model=List[TaskResponse])
async def get_updated_tasks(
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """
    Get tasks updated by the current user.
    Args:
        current_user (User): The user making the request, used for auditing.
        db (AsyncSession): Database session dependency.
    Returns:
        List[TaskResponse]: A list of tasks updated by the user.
    Raises:
        HTTPException: If no tasks are found for the user.
    """
    tasks = await service.get_tasks_updated_by_user(current_user.id)
    return tasks

@router.get("/tasks/assigned", response_model=List[TaskResponse])
async def get_assigned_tasks(
    current_user: User = Depends(get_current_user),
    service: TaskService = Depends(get_task_service)
):
    """
    Get tasks assigned to the current user.
    Args:
        current_user (User): The user making the request, used for auditing.
        db (AsyncSession): Database session dependency.
    Returns:
        List[TaskResponse]: A list of tasks assigned to the user.
    Raises:
        HTTPException: If no tasks are found for the user.
    """
    tasks = await service.get_tasks_assigned_to_user(current_user.id)
    return tasks

@router.get("/tasks/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks_endpoint(
    service: TaskService = Depends(get_task_service)
):
    """
    Get all overdue tasks.
    This endpoint retrieves tasks that are overdue (due date in the past and not completed).
    Args:
        db (AsyncSession): Database session dependency.
    Returns:
        List[TaskResponse]: A list of overdue tasks with enriched user information.
    Raises:
        HTTPException: If no overdue tasks are found.
    """
    tasks = await service.get_overdue_tasks()
    return tasks

@router.get("/tasks/search", response_model=List[TaskResponse])
async def search_tasks(
    query: str,
    service: TaskService = Depends(get_task_service),
    pagination: PaginationParams = Depends()
):
    """
    Search for tasks by title.
    Args:
        query (str): The search query to filter tasks by title.
        db (AsyncSession): Database session dependency.
        pagination (PaginationParams): Pagination parameters for the request.
    Returns:
        List[TaskResponse]: A list of tasks matching the search query with pagination.
    Raises:
        HTTPException: If the search query is empty or if no tasks are found.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    tasks = await service.search_tasks_by_title(query, pagination.skip, pagination.limit)
    return tasks

@router.get("/tasks/created_by/{user_id}", response_model=List[TaskResponse])
async def get_tasks_created_by_user_route(
    user_id: int,
    service: TaskService = Depends(get_task_service)
):
    """Get tasks created by a specific user.
    Args:
        user_id (int): The ID of the user whose created tasks are to be retrieved.
        db (AsyncSession): Database session dependency.
    Returns:
        List[TaskResponse]: A list of tasks created by the specified user with enriched user information.
    Raises:
        HTTPException: If no tasks are found for the user.
    """
    tasks = await service.get_tasks_created_by_user(user_id)
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    service: TaskService = Depends(get_task_service)
):
    """
    Get a task by its ID.
    Args:
        task_id (int): The ID of the task to retrieve.
        db (AsyncSession): Database session dependency.
    Returns:
        TaskResponse: The task with the specified ID, enriched with user information.
    Raises:
        HTTPException: If the task is not found.
    """
    task = await service.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: str,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Update the status of a task by its ID.
    Args:
        task_id (int): The ID of the task to update.
        status (str): The new status for the task.
        db (AsyncSession): Database session dependency.
        current_user (User): The user making the request, used for auditing.
    Returns:
        TaskResponse: The updated task with the new status.
    Raises:
        HTTPException: If the task is not found or if the status update fails.
    """
    try:
        task = await service.update_task_status(task_id, status, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/tasks/{task_id}", response_model=TaskResponse)
async def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a task by its ID.
    Args:
        task_id (int): The ID of the task to delete.
        db (AsyncSession): Database session dependency.
    Returns:
        TaskResponse: The deleted task.
    Raises:
        HTTPException: If the task is not found or if the deletion fails.
    """
    task = await service.get_task_by_id(task_id)
    if task.created_by != current_user.username and current_user.type != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this task")
    task = await service.delete_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/tasks/{task_id}/comments", response_model=TaskCommentResponse)
async def add_task_comment(
    task_id: int,
    comment_data: TaskComment,
    service: TaskService = Depends(get_task_service),
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
    service: TaskService = Depends(get_task_service)
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
    service: TaskService = Depends(get_task_service),
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
    return await service.delete_comment_from_task(task_id, comment_id, current_user.id)
