import pytest
import pytest_asyncio
from app.repositories.auth import AuthRepository
from app.schemas.auth import UserCreate
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.mark.asyncio
async def test_get_user_by_username_found(db_session, create_test_user):
    """Test getting user by username when user exists."""
    # Create test user
    user = await create_test_user("testuser", "password123")
    
    # Test repository method
    repo = AuthRepository(db_session)
    found_user = await repo.get_user_by_username_in_db("testuser")
    
    assert found_user is not None
    assert found_user.username == "testuser"
    assert found_user.email == "testuser@test.com"

@pytest.mark.asyncio
async def test_get_user_by_username_not_found(db_session):
    """Test getting user by username when user doesn't exist."""
    repo = AuthRepository(db_session)
    found_user = await repo.get_user_by_username_in_db("nonexistent")
    
    assert found_user is None

@pytest.mark.asyncio
async def test_get_user_by_email_found(db_session, create_test_user):
    """Test getting user by email when user exists."""
    # Create test user
    user = await create_test_user("testuser", "password123", email="test@example.com")
    
    # Test repository method
    repo = AuthRepository(db_session)
    found_user = await repo.get_user_by_email_in_db("test@example.com")
    
    assert found_user is not None
    assert found_user.email == "test@example.com"
    assert found_user.username == "testuser"

@pytest.mark.asyncio
async def test_get_user_by_email_not_found(db_session):
    """Test getting user by email when user doesn't exist."""
    repo = AuthRepository(db_session)
    found_user = await repo.get_user_by_email_in_db("nonexistent@example.com")
    
    assert found_user is None

@pytest.mark.asyncio
async def test_create_user_success(db_session):
    """Test creating a new user successfully."""
    repo = AuthRepository(db_session)
    
    user_data = UserCreate(
        username="newuser",
        email="newuser@example.com",
        full_name="New User",
        password="password123"
    )
    
    created_user = await repo.create_user_in_db(user_data)
    
    assert created_user is not None
    assert created_user.username == "newuser"
    assert created_user.email == "newuser@example.com"
    assert created_user.full_name == "New User"
    assert created_user.is_active is True
    assert created_user.type == "user"
    # Verify password is hashed
    assert created_user.hashed_password != "password123"
    assert pwd_context.verify("password123", created_user.hashed_password)

@pytest.mark.asyncio
async def test_create_user_with_hashed_password(db_session):
    """Test creating user with pre-hashed password."""
    repo = AuthRepository(db_session)
    
    hashed_password = pwd_context.hash("password123")
    user_data = UserCreate(
        username="hasheduser",
        email="hashed@example.com",
        full_name="Hashed User",
        password=hashed_password
    )
    
    created_user = await repo.create_user_in_db(user_data, hashed=True)
    
    assert created_user is not None
    assert created_user.hashed_password == hashed_password
    assert pwd_context.verify("password123", created_user.hashed_password)

@pytest.mark.asyncio
async def test_verify_password_correct(db_session):
    """Test password verification with correct password."""
    repo = AuthRepository(db_session)
    
    plain_password = "testpassword123"
    hashed_password = pwd_context.hash(plain_password)
    
    is_valid = repo.verify_password(plain_password, hashed_password)
    assert is_valid is True

@pytest.mark.asyncio
async def test_verify_password_incorrect(db_session):
    """Test password verification with incorrect password."""
    repo = AuthRepository(db_session)
    
    plain_password = "testpassword123"
    wrong_password = "wrongpassword"
    hashed_password = pwd_context.hash(plain_password)
    
    is_valid = repo.verify_password(wrong_password, hashed_password)
    assert is_valid is False

@pytest.mark.asyncio
async def test_hash_password_generates_different_hashes(db_session):
    """Test that hash_password generates different hashes for same password."""
    repo = AuthRepository(db_session)
    
    password = "testpassword123"
    hash1 = repo.hash_password(password)
    hash2 = repo.hash_password(password)
    
    assert hash1 is not None
    assert hash2 is not None
    assert hash1 != hash2  # Different salts should produce different hashes
    assert pwd_context.verify(password, hash1)
    assert pwd_context.verify(password, hash2)

@pytest.mark.asyncio
async def test_get_all_users_in_db(db_session, create_test_user):
    """Test getting all users from database."""
    # Create multiple test users
    await create_test_user("user1", "pass1")
    await create_test_user("user2", "pass2")
    await create_test_user("user3", "pass3")
    
    repo = AuthRepository(db_session)
    users = await repo.get_all_users_in_db()
    
    assert len(users) >= 3
    usernames = [user.username for user in users]
    assert "user1" in usernames
    assert "user2" in usernames
    assert "user3" in usernames