from fastapi import HTTPException, status
from passlib.context import CryptContext
from app.repositories.auth import AuthRepository
from app.schemas.auth import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def authenticate_user(self, username: str, password: str):
        user = await self.repo.get_user_by_username(username)
        if not user or not self.repo.verify_password(password, user.hashed_password):
            return None
        return user

    async def register_user(self, user_data: UserCreate):
        existing_user = await self.repo.get_user_by_username(user_data.username)
        if existing_user:
            raise HTTPException(status_code=409, detail="Username already registered")
        
        existing_email = await self.repo.get_user_by_email(user_data.email)
        if existing_email:
            raise HTTPException(status_code=409, detail="Email already registered")

        return await self.repo.create_user_in_db(user_data)

    async def get_all_users(self):
        return await self.repo.get_all_users_in_db()

    async def admin_create_user(self, user_data: UserCreate):
        return await self.register_user(user_data)

    async def admin_delete_user(self, user_id: int):
        return await self.repo.delete_user_in_db(user_id)

    async def get_user_by_username(self, username: str):
        return await self.repo.get_user_by_username(username)

    async def update_user(self, user_id: int, update_data: dict):
        # Lógica de negocio: verificar si el nuevo username o email ya existen
        if "username" in update_data:
            existing_user = await self.repo.get_user_by_username(update_data["username"])
            if existing_user and existing_user.id != user_id:
                raise HTTPException(status_code=409, detail="Username already taken")

        if "email" in update_data:
            existing_user = await self.repo.get_user_by_email(update_data["email"])
            if existing_user and existing_user.id != user_id:
                raise HTTPException(status_code=409, detail="Email already registered")

        # Pasa los datos al repositorio para la actualización en la BD
        return await self.repo.update_user_in_db(user_id, update_data)