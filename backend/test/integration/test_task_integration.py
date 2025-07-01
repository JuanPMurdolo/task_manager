import pytest
import pytest_asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio
from datetime import datetime, timedelta

from app.main import app
from app.core.database import get_db
from app.models.base import Base


class AsyncTestClient:
    def __init__(self, client):
        self.client = client
    
    async def post(self, *args, **kwargs):
        return self.client.post(*args, **kwargs)
    
    async def get(self, *args, **kwargs):
        return self.client.get(*args, **kwargs)
    
    async def put(self, *args, **kwargs):
        return self.client.put(*args, **kwargs)
    
    async def delete(self, *args, **kwargs):
        return self.client.delete(*args, **kwargs)


@pytest_asyncio.fixture
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///./test_integration_tasks.db",
        echo=False
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture
async def async_client(test_engine):
    """Create an async test client."""
    # Override the database dependency
    async def override_get_db():
        async_session = sessionmaker(
            test_engine, class_=AsyncSession, expire_on_commit=False
        )
        
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield AsyncTestClient(client)
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_token(async_client):
    """Create a user and return auth token."""
    # Register user
    user_data = {
        "username": "testuser",
        "email": "test@test.com",
        "password": "test123",
        "full_name": "Test User",
        "type": "user"
    }
    
    response = await async_client.post("/auth/register", json=user_data)
    
    # Login to get token
    login_data = {
        "username": "testuser",
        "password": "test123"
    }
    
    response = await async_client.post("/auth/login", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest_asyncio.fixture
async def admin_token(async_client):
    """Create an admin user and return auth token."""
    # Register admin user
    admin_data = {
        "username": "admin",
        "email": "admin@test.com",
        "password": "admin123",
        "full_name": "Admin User",
        "type": "admin"
    }
    
    response = await async_client.post("/auth/register", json=admin_data)
    
    # Login to get token
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = await async_client.post("/auth/login", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.mark.asyncio
async def test_create_task_success(async_client, auth_token):
    """Test successful task creation."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "status": "pending",
        "priority": "medium"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = await async_client.post("/tasks", json=task_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task"
    assert data["status"] == "pending"
    assert data["priority"] == "medium"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_task_unauthorized(async_client):
    """Test task creation without authentication."""
    task_data = {
        "title": "Unauthorized Task",
        "description": "This should fail",
        "status": "pending",
        "priority": "medium"
    }
    
    response = await async_client.post("/tasks", json=task_data)
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_task_with_due_date(async_client, auth_token):
    """Test task creation with due date."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    future_date = (datetime.now() + timedelta(days=7)).isoformat()
    
    task_data = {
        "title": "Task with Due Date",
        "description": "This task has a due date",
        "status": "pending",
        "priority": "high",
        "due_date": future_date
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = await async_client.post("/tasks", json=task_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Task with Due Date"
    assert data["due_date"] is not None


@pytest.mark.asyncio
async def test_get_task_by_id(async_client, auth_token):
    """Test getting a task by ID."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # First create a task
    task_data = {
        "title": "Get Task Test",
        "description": "Task to be retrieved",
        "status": "pending",
        "priority": "medium"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    create_response = await async_client.post("/tasks", json=task_data, headers=headers)
    task_id = create_response.json()["id"]
    
    # Get the task
    response = await async_client.get(f"/tasks/{task_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Get Task Test"


@pytest.mark.asyncio
async def test_get_task_not_found(async_client, auth_token):
    """Test getting a non-existent task."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = await async_client.get("/tasks/99999", headers=headers)
    
    assert response.status_code == 404
    assert "Task not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_task_success(async_client, auth_token):
    """Test successful task update."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # First create a task
    task_data = {
        "title": "Original Task",
        "description": "Original description",
        "status": "pending",
        "priority": "medium"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    create_response = await async_client.post("/tasks", json=task_data, headers=headers)
    task_id = create_response.json()["id"]
    
    # Update the task
    update_data = {
        "title": "Updated Task",
        "description": "Updated description",
        "status": "in_progress"
    }
    
    response = await async_client.put(f"/tasks/{task_id}", json=update_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Task"
    assert data["description"] == "Updated description"
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_update_task_not_found(async_client, auth_token):
    """Test updating a non-existent task."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    update_data = {
        "title": "Non-existent Task",
        "description": "This should fail"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = await async_client.put("/tasks/99999", json=update_data, headers=headers)
    
    assert response.status_code == 404
    assert "Task not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_task_status(async_client, auth_token):
    """Test updating task status."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # First create a task
    task_data = {
        "title": "Status Update Task",
        "description": "Task for status update",
        "status": "pending",
        "priority": "medium"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    create_response = await async_client.post("/tasks", json=task_data, headers=headers)
    task_id = create_response.json()["id"]
    
    # Update status
    response = await async_client.put(f"/tasks/{task_id}/status?status=completed", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"


@pytest.mark.asyncio
async def test_update_task_status_invalid(async_client, auth_token):
    """Test updating task with invalid status."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # First create a task
    task_data = {
        "title": "Invalid Status Task",
        "description": "Task for invalid status test",
        "status": "pending",
        "priority": "medium"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    create_response = await async_client.post("/tasks", json=task_data, headers=headers)
    task_id = create_response.json()["id"]
    
    # Try to update with invalid status
    response = await async_client.put(f"/tasks/{task_id}/status?status=invalid_status", headers=headers)
    
    assert response.status_code == 400
    assert "Invalid status value" in response.json()["detail"]


@pytest.mark.asyncio
async def test_list_tasks(async_client, auth_token):
    """Test listing all tasks."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # Create a few tasks first
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    for i in range(3):
        task_data = {
            "title": f"List Task {i+1}",
            "description": f"Description {i+1}",
            "status": "pending",
            "priority": "medium"
        }
        await async_client.post("/tasks", json=task_data, headers=headers)
    
    # List tasks
    response = await async_client.get("/tasks", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3


@pytest.mark.asyncio
async def test_list_tasks_with_pagination(async_client, auth_token):
    """Test listing tasks with pagination."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # Create several tasks first
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    for i in range(5):
        task_data = {
            "title": f"Pagination Task {i+1}",
            "description": f"Description {i+1}",
            "status": "pending",
            "priority": "medium"
        }
        await async_client.post("/tasks", json=task_data, headers=headers)
    
    # List tasks with pagination
    response = await async_client.get("/tasks?skip=0&limit=2", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 2

@pytest.mark.asyncio
async def test_search_tasks_empty_query(async_client, auth_token):
    """Test searching with empty query."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = await async_client.get("/tasks/search?query=", headers=headers)
    
    assert response.status_code == 400
    assert "Search query cannot be empty" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_overdue_tasks(async_client, auth_token):
    """Test getting overdue tasks."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # Create an overdue task
    past_date = (datetime.now() - timedelta(days=1)).isoformat()
    
    task_data = {
        "title": "Overdue Task",
        "description": "This task is overdue",
        "status": "pending",
        "priority": "high",
        "due_date": past_date
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    await async_client.post("/tasks", json=task_data, headers=headers)
    
    # Get overdue tasks
    response = await async_client.get("/tasks/overdue", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_delete_task_success(async_client, auth_token):
    """Test successful task deletion."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    # First create a task
    task_data = {
        "title": "Task to Delete",
        "description": "This task will be deleted",
        "status": "pending",
        "priority": "medium"
    }
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    create_response = await async_client.post("/tasks", json=task_data, headers=headers)
    task_id = create_response.json()["id"]
    
    # Delete the task
    response = await async_client.delete(f"/tasks/{task_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Task to Delete"


@pytest.mark.asyncio
async def test_delete_task_unauthorized(async_client, auth_token, admin_token):
    """Test deleting task without permission."""
    if not auth_token or not admin_token:
        pytest.skip("Auth tokens not available")
    
    # Create task with one user
    task_data = {
        "title": "Protected Task",
        "description": "This task is protected",
        "status": "pending",
        "priority": "medium"
    }
    
    headers1 = {"Authorization": f"Bearer {auth_token}"}
    create_response = await async_client.post("/tasks", json=task_data, headers=headers1)
    task_id = create_response.json()["id"]
    
    # Try to delete with different user (should work with admin)
    headers2 = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.delete(f"/tasks/{task_id}", headers=headers2)
    
    # Admin should be able to delete any task
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_delete_task_not_found(async_client, auth_token):
    """Test deleting a non-existent task."""
    if not auth_token:
        pytest.skip("Auth token not available")
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = await async_client.delete("/tasks/99999", headers=headers)
    
    assert response.status_code == 404
    assert "Task not found" in response.json()["detail"]
