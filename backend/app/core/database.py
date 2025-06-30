import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.user import User
from app.models.task import Task
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import select


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

load_dotenv()

USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"
DATABASE_URL = os.getenv("DATABASE_URL")

if USE_SQLITE:
    DATABASE_URL = "sqlite+aiosqlite:///./tasks.db"
elif not DATABASE_URL:
    raise ValueError("DATABASE_URL not set and USE_SQLITE is false")

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def create_admin():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.username == 'admin'))
        existing = result.scalar_one_or_none()
        if not existing:
            hashed_password = pwd_context.hash('123456')
            admin = User(
                username='admin',
                email='admin@example.com',
                full_name='Admin User',
                hashed_password=hashed_password,
                is_active=True,
                type='admin'
            )
            session.add(admin)
            await session.commit()
            print('✅ Usuario admin creado')
        else:
            print('ℹ️ El usuario admin ya existe')
