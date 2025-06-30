from abc import ABC, abstractmethod
from app.models.user import User

class AbstractAuthRepository(ABC):
    @abstractmethod
    async def get_user_by_username(self, username: str) -> User | None:
        ...

    @abstractmethod
    def verify_password(self, plain: str, hashed: str) -> bool:
        ...

    @abstractmethod
    def hash_password(self, plain: str) -> str:
        ...