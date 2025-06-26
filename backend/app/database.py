from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base

DATABASE_URL = "sqlite+aiosqlite:///./plans.db" # Use your actual database URL here
# For PostgreSQL, it would look like:
# DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"
# For MySQL, it would look like:
# DATABASE_URL = "mysql+aiomysql://user:password@localhost/dbname"

engine = create_async_engine(DATABASE_URL, echo=False)

# Create a session factory for async sessions
# This will be used to create new sessions for each request
AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for all models
async def init_db():
    """
    Initialize the database by creating all tables defined in the models.
    This function should be called once at the startup of the application.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency to get the database session
# This will be used in FastAPI routes to get a session for each request
async def get_db():
    """
    Dependency to get a database session.
    This function yields a session that can be used in FastAPI routes.
    It ensures that the session is properly closed after use.
    """
    async with AsyncSessionLocal() as session:
        yield session