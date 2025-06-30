import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

from app.core.database import Base
from app.models.user import User
from app.models.task import Task

# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Clean up
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine):
    """Create a database session for testing."""
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def create_test_user(db_session):
    """Factory fixture to create test users."""
    created_users = []
    
    async def _create_user(username: str, password: str, email: str = None):
        # Generate unique identifiers to avoid conflicts
        unique_id = str(uuid.uuid4())[:8]
        unique_username = f"{username}"
        unique_email = email or f"{username}@test.com"
        
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash(password)
        
        user = User(
            username=unique_username,
            email=unique_email,
            full_name=f"Test {username.title()}",
            hashed_password=hashed_password,
            is_active=True,
            type="user",
            created_at=datetime.utcnow()
        )
        
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        created_users.append(user)
        return user
    
    yield _create_user
    
    # Cleanup created users
    for user in created_users:
        try:
            await db_session.delete(user)
            await db_session.commit()
        except:
            pass  # User might already be deleted

@pytest_asyncio.fixture(scope="function")
async def test_user(create_test_user):
    """Create a single test user."""
    return await create_test_user("testuser", "testpassword123")

@pytest_asyncio.fixture(scope="function")
async def test_users(create_test_user):
    """Create multiple test users."""
    users = []
    for i in range(3):
        user = await create_test_user(f"user{i+1}", f"password{i+1}")
        users.append(user)
    return users
