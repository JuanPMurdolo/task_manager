from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from typing import List, Optional
from passlib.context import CryptContext

from app.models.user import User
from app.database import get_db
from app.schemas.user import LoginResponse, LoginRequest, UserResponse, UserCreate
from app.auth import authenticate_user, create_access_token, get_current_user
from app.repositories.auth import (
    get_user_by_username_in_db,
    get_user_by_email_in_db,
    create_user_in_db,
    get_all_users_in_db,
)

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/auth/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_username_in_db(db, form_data.username)
    if user is None or not authenticate_user(user, form_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return LoginResponse(access_token=access_token, token_type="bearer", user=UserResponse.from_orm(user))

@router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    if await get_user_by_username_in_db(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if await get_user_by_email_in_db(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user_in_db(db, user_data)
    return UserResponse.from_orm(user)

@router.post("/auth/logout")
async def logout():
    return {"message": "Logout successful. Please delete the token on the client side."}

@router.get("/auth/check", response_model=UserResponse)
async def check_permissions(current_user = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

@router.get("/users/getall", response_model=List[UserResponse])
async def get_all(db: AsyncSession = Depends(get_db)):
    users = await get_all_users_in_db(db)
    return [UserResponse.from_orm(u) for u in users]

@router.post("/users", response_model=UserResponse)
async def admin_create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")

    if await get_user_by_username_in_db(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if await get_user_by_email_in_db(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user_in_db(db, user_data, hashed=True)
    return UserResponse.from_orm(user)