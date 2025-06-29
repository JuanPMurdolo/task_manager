import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.core.auth import create_access_token
from passlib.context import CryptContext
from datetime import datetime

DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine_test = create_async_engine(DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(bind=engine_test, class_=AsyncSession, expire_on_commit=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Override DB
async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture(scope="module")
async def test_client():
    # Crear tablas
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


# Fixture para crear un usuario en la base de datos
@pytest.fixture
async def create_test_user(db_session: AsyncSession):
    async def _create_user(username: str, password: str, user_type: str = "user"):
        hashed_pw = pwd_context.hash(password)
        user = User(
            username=username,
            email=f"{username}@test.com",
            full_name=f"{username.capitalize()} Tester",
            hashed_password=hashed_pw,
            is_active=True,
            type=user_type,
            created_at=datetime.utcnow()
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user
    return _create_user


# Fixture para obtener headers JWT válidos
@pytest.fixture
async def get_token_headers(create_test_user):
    async def _get_headers(username: str, password: str = "test123"):
        user = await create_test_user(username=username, password=password)
        token = create_access_token(data={"sub": user.username})
        return {"Authorization": f"Bearer {token}"}
    return _get_headers