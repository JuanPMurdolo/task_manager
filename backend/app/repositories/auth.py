from app.repositories.interfaces.auth import AbstractAuthRepository
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from fastapi import Depends
from app.core.database import get_db

from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthRepository(AbstractAuthRepository):
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_user_by_username(self, username: str) -> User | None:
        return await self.get_user_by_username_in_db(username)
    
    async def get_user_by_email(self, email: str) -> User | None:
        return await self.get_user_by_email_in_db(email)
    
    async def create_user(self, user_data, hashed: bool = False) -> User:
        hashed_password = pwd_context.hash(user_data.password)
        return await self.create_user_in_db(user_data, hashed_password)
    
    def hash_password(self, plain: str) -> str:
        return pwd_context.hash(plain)
    
    def verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    async def get_user_by_username_in_db(self, username: str):
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_user_by_email_in_db(self, email: str):
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_user_in_db(self, user_data, hashed: bool = False):
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

        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return new_user

    async def get_all_users_in_db(self):
        result = await self.db.execute(select(User))
        return result.scalars().all()

    async def delete_user_in_db(self, user_id: int):
        user = await self.db.get(User, user_id)
        if not user:
            return None

        await self.db.delete(user)
        await self.db.commit()
        return user

    async def update_user_in_db(self, user_id: int, update_data: dict):
        user = await self.db.get(User, user_id)
        if not user:
            return None

        for key, value in update_data.items():
            # El router envía la contraseña hasheada bajo la clave "password"
            # El modelo de la BD la almacena como "hashed_password"
            db_key = "hashed_password" if key == "password" else key
            if hasattr(user, db_key):
                setattr(user, db_key, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user