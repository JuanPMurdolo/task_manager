from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession


from app.api import router as api_router
from app.auth_router import router as auth_router
from app.database import init_db, AsyncSessionLocal

app = FastAPI(
    title="Lemon Challenge Task management",
    description="Challenge for Lemon Cash, a task management system",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    await init_db()
    
app.include_router(api_router)
app.include_router(auth_router, tags=["auth"])