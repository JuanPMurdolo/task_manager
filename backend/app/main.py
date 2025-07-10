from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


from app.routers.task import router as api_router
from app.routers.auth import router as auth_router
from app.routers.comment import router as comment_router
from app.core.database import init_db, AsyncSessionLocal, create_admin

app = FastAPI(
    title="Lemon Challenge Task management",
    description="Challenge for Lemon Cash, a task management system",
    version="1.0.0"
)

# Inicializa el rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

load_dotenv()

@app.on_event("startup")
async def startup_event():
    await init_db()
    await create_admin()  # Ensure admin user is created on startup

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # <-- Frontend dev en React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
app.include_router(api_router)
app.include_router(auth_router, tags=["auth"])
app.include_router(comment_router, tags=["comments"])