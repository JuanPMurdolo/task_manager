from app.repositories.auth import AuthRepository
from app.repositories.interfaces.auth import AbstractAuthRepository
from app.models.user import User
from app.schemas.auth import LoginRequest

class AuthService:
    def __init__(self, repo: AuthRepository):
        self.repo = repo

    async def authenticate_user(self, username: str, password: str) -> User | None:
        user = await self.repo.get_user_by_username(username)
        if not user or not self.repo.verify_password(password, user.hashed_password):
            return None
        return user
    
    async def admin_create_user(self, user_data: LoginRequest) -> User:
        existing_user = await self.repo.get_user_by_username(user_data.username)
        if existing_user:
            raise ValueError("User already exists")
        
        hashed_password = self.repo.hash_password(user_data.password)
        return await self.repo.create_user_in_db(user_data, hashed=True)
    
    async def register_user(self, user_data: LoginRequest) -> User:
        existing_user = await self.repo.get_user_by_username(user_data.username)
        if existing_user:
            raise ValueError("User already exists")
        
        hashed_password = self.repo.hash_password(user_data.password)
        return await self.repo.create_user_in_db(user_data, hashed=True)
    
    async def get_all_users(self) -> list[User]:
        return await self.repo.get_all_users_in_db()


