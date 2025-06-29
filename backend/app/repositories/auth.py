from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from fastapi import Depends
from app.core.database import get_db

from app.models.user import User

db: AsyncSession = Depends(get_db)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_username_in_db(db, username: str):
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()

async def get_user_by_email_in_db(db, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def create_user_in_db(db, user_data, hashed: bool = False):
    password = user_data.password
    hashed_password = password if hashed else pwd_context.hash(password)

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True,
        type=getattr(user_data, "type", "user"),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def get_all_users_in_db(db):
    result = await db.execute(select(User))
    return result.scalars().all()
