

from app.database import AsyncSessionLocal
from app.schemas import User
from sqlalchemy import select


async def get_username_by_id(user_id: int, db: AsyncSessionLocal) -> str:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user.username if user else "Unknown"