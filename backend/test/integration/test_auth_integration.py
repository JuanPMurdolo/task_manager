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
        "sqlite+aiosqlite:///./test_integration.db",
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


@pytest_asyncio.fixture
async def regular_user_token(async_client):
    """Create a regular user and return auth token."""
    # Register regular user
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


@pytest.mark.asyncio
async def test_register_user_success(async_client):
    """Test successful user registration."""
    user_data = {
        "username": "newuser",
        "email": "newuser@test.com",
        "password": "password123",
        "full_name": "New User",
        "type": "user"
    }
    
    response = await async_client.post("/auth/register", json=user_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@test.com"
    assert data["full_name"] == "New User"
    assert "password" not in data


@pytest.mark.asyncio
async def test_login_success(async_client):
    """Test successful login."""
    # Register user first
    user_data = {
        "username": "loginuser",
        "email": "login@test.com",
        "password": "password123",
        "full_name": "Login User",
        "type": "user"
    }
    
    await async_client.post("/auth/register", json=user_data)
    
    # Login
    login_data = {
        "username": "loginuser",
        "password": "password123"
    }
    
    response = await async_client.post("/auth/login", data=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client):
    """Test login with invalid credentials."""
    login_data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    
    response = await async_client.post("/auth/login", data=login_data)
    
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_logout(async_client):
    """Test logout endpoint."""
    response = await async_client.post("/auth/logout")
    
    assert response.status_code == 200
    data = response.json()
    assert "Logout successful" in data["message"]


@pytest.mark.asyncio
async def test_get_all_users(async_client, admin_token):
    """Test getting all users as admin."""
    if not admin_token:
        pytest.skip("Admin token not available")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.get("/users/getall", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1  # At least the admin user


@pytest.mark.asyncio
async def test_admin_create_user(async_client, admin_token):
    """Test admin creating a user."""
    if not admin_token:
        pytest.skip("Admin token not available")
    
    user_data = {
        "username": "admincreated",
        "email": "admincreated@test.com",
        "password": "password123",
        "full_name": "Admin Created User",
        "type": "user"
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.post("/users", json=user_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admincreated"


@pytest.mark.asyncio
async def test_admin_create_user_unauthorized(async_client, regular_user_token):
    """Test non-admin trying to create user."""
    if not regular_user_token:
        pytest.skip("Regular user token not available")
    
    user_data = {
        "username": "unauthorized",
        "email": "unauthorized@test.com",
        "password": "password123",
        "full_name": "Unauthorized User",
        "type": "user"
    }
    
    headers = {"Authorization": f"Bearer {regular_user_token}"}
    response = await async_client.post("/users", json=user_data, headers=headers)
    
    assert response.status_code == 403
    assert "Only admins can create users" in response.json()["detail"]


@pytest.mark.asyncio
async def test_admin_update_user(async_client, admin_token):
    """Test admin updating a user."""
    if not admin_token:
        pytest.skip("Admin token not available")
    
    # First create a user to update
    user_data = {
        "username": "toupdate",
        "email": "toupdate@test.com",
        "password": "password123",
        "full_name": "To Update User",
        "type": "user"
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    create_response = await async_client.post("/users", json=user_data, headers=headers)
    user_id = create_response.json()["id"]
    
    # Update the user
    update_data = {
        "full_name": "Updated User",
        "email": "updated@test.com"
    }
    
    response = await async_client.put(f"/users/{user_id}", json=update_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated User"
    assert data["email"] == "updated@test.com"


@pytest.mark.asyncio
async def test_admin_delete_user(async_client, admin_token):
    """Test admin deleting a user."""
    if not admin_token:
        pytest.skip("Admin token not available")
    
    # First create a user to delete
    user_data = {
        "username": "todelete",
        "email": "todelete@test.com",
        "password": "password123",
        "full_name": "To Delete User",
        "type": "user"
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    create_response = await async_client.post("/users", json=user_data, headers=headers)
    user_id = create_response.json()["id"]
    
    # Delete the user
    response = await async_client.delete(f"/users/{user_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "todelete"


@pytest.mark.asyncio
async def test_check_permissions_unauthorized(async_client):
    """Test check permissions without token."""
    response = await async_client.get("/auth/check")
    
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]