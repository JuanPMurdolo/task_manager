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
from app.services.task import TaskService

router = APIRouter()


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
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
    service = TaskService(db)
    new_task = await service.create_task(task_data, current_user.id)
    return new_task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
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
    service = TaskService(db)
    task = await service.update_task(task_id, task_update, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/tasks/bulk_update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    task_update: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db),
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
    service = TaskService(db)
    if not task_update.task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")
    tasks = await service.bulk_update_tasks(task_update.task_ids, task_update, current_user.id)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return await tasks

@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    List all tasks with pagination support.
    
    Args:
        pagination (PaginationParams): Pagination parameters for the request.
        db (AsyncSession): Database session dependency.
    """
    service = TaskService(db)
    tasks = await service.list_tasks(pagination=pagination)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    return tasks
    

@router.get("/tasks/created", response_model=List[TaskResponse])
async def get_created_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
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
    service = TaskService(db)
    tasks = await service.get_tasks_created_by_user(current_user.id)
    return tasks

@router.get("/tasks/updated", response_model=List[TaskResponse])
async def get_updated_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
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
    service = TaskService(db)
    tasks = await service.get_tasks_updated_by_user(current_user.id)
    return tasks

@router.get("/tasks/assigned", response_model=List[TaskResponse])
async def get_assigned_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
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
    service = TaskRepository(db)
    tasks = await service.get_tasks_assigned_to_user(current_user.id)
    return tasks

@router.get("/tasks/overdue", response_model=List[TaskResponse])
async def get_overdue_tasks_endpoint(
    db: AsyncSession = Depends(get_db)
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
    service = TaskService(db)
    tasks = await service.get_overdue_tasks()
    return tasks

@router.get("/tasks/search", response_model=List[TaskResponse])
async def search_tasks(
    query: str,
    db: AsyncSession = Depends(get_db),
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
    service = TaskService(db)
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    tasks = await service.search_tasks_by_title(query, pagination.skip, pagination.limit)
    return tasks

@router.get("/tasks/created_by/{user_id}", response_model=List[TaskResponse])
async def get_tasks_created_by_user_route(
    user_id: int,
    db: AsyncSession = Depends(get_db)
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
    service = TaskService(db)
    tasks = await service.get_tasks_created_by_user(user_id)
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
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
    service = TaskService(db)
    task = await service.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
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
    service = TaskService(db)
    try:
        task = await service.update_task_status(task_id, status, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task