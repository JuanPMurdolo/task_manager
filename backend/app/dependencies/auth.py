from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.auth import AuthRepository
from app.services.auth import AuthService

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    repo = AuthRepository(db)
    return AuthService(repo)