from app.dependencies.auth import get_auth_service
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from typing import List, Optional
from passlib.context import CryptContext
from slowapi.decorator import limiter

from app.models.user import User
from app.core.database import get_db
from app.schemas.auth import LoginResponse, LoginRequest, UserResponse, UserCreate, UserUpdate
from app.core.auth import authenticate_user, create_access_token, get_current_user
from app.services.auth import AuthService

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/auth/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Login endpoint for user authentication.
    This endpoint uses OAuth2PasswordRequestForm to receive username and password.
    It authenticates the user and returns an access token if successful.
    :param form_data: OAuth2PasswordRequestForm containing username and password.
    :param auth_service: AuthService dependency for user authentication.
    :return: LoginResponse schema containing the access token, token type, and user data.
    :raises HTTPException: If the credentials are invalid, it raises a 401 Unauthorized error.
    """
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=30))
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.post("/auth/register", response_model=UserResponse)
@limiter.limit("5/minute")
async def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user.
    This endpoint allows new users to register by providing their user data.
    :param user_data: UserCreate schema containing the new user's data.
    :param auth_service: AuthService dependency for user registration.
    :return: UserResponse schema containing the newly created user's data.
    :raises HTTPException: If the user already exists, it raises a 400 Bad Request error.
    :raises HTTPException: If the registration fails, it raises a 500 Internal Server Error.
    """
    user = await auth_service.register_user(user_data)
    return UserResponse.from_orm(user)


@router.post("/auth/logout")
async def logout():
    """
    Logout endpoint.
    This endpoint is used to log out the user by invalidating the access token.
    :return: A message indicating successful logout.
    """
    return {"message": "Logout successful. Please delete the token on the client side."}


@router.get("/auth/check", response_model=UserResponse)
async def check_permissions(current_user: User = Depends(get_current_user)):
    """
    Check the current user's permissions.
    This endpoint returns the current user's data if they are authenticated.
    :param current_user: User dependency to get the currently authenticated user.
    :return: UserResponse schema containing the current user's data.
    :raises HTTPException: If the user is not authenticated, it raises a 401 Unauthorized
    error.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive")
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="User is not verified")
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="User is not an admin")
    return UserResponse.from_orm(current_user)


@router.get("/users/getall", response_model=List[UserResponse])
@limiter.limit("5/minute")
async def get_all_users(auth_service: AuthService = Depends(get_auth_service)):
    """ Get all users.
    This endpoint retrieves all users from the database.
    :param auth_service: AuthService dependency for user management.
    :return: List of UserResponse schemas containing all users' data.
    """
    users = await auth_service.get_all_users()
    return [UserResponse.from_orm(u) for u in users]


@router.post("/users", response_model=UserResponse)
@limiter.limit("5/minute")
async def admin_create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Create a new user.
    This endpoint allows an admin to create a new user by providing the user data.
    :param user_data: UserCreate schema containing the new user's data.
    :param current_user: User dependency to get the currently authenticated user.
    :param auth_service: AuthService dependency for user management.
    :return: UserResponse schema containing the newly created user's data.
    :raises HTTPException: If the current user is not an admin, it raises a 403 Forbidden error.
    :raises HTTPException: If the user creation fails, it raises a 500 Internal Server Error.
    """
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users")

    user = await auth_service.admin_create_user(user_data)
    return UserResponse.from_orm(user)

@router.delete("/users/{user_id}", response_model=UserResponse)
@limiter.limit("5/minute")
async def admin_delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Delete a user by ID.
    This endpoint allows an admin to delete a user by their ID.
    :param user_id: ID of the user to be deleted.
    :param current_user: User dependency to get the currently authenticated user.
    :param auth_service: AuthService dependency for user management.
    :return: UserResponse schema containing the deleted user's data.
    :raises HTTPException: If the current user is not an admin, it raises a 403 Forbidden error.
    :raises HTTPException: If the user to be deleted is not found, it raises a 404 Not Found error.
    """
    if current_user.type != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    user = await auth_service.admin_delete_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

@router.put("/users/{user_id}", response_model=UserResponse)
@limiter.limit("5/minute")
async def admin_update_user(
    user_id: int,
    user_data: UserUpdate, # 2. Usa el nuevo schema UserUpdate
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Update a user by ID.
    This endpoint allows an admin to update a user's data by their ID.
    :param user_id: ID of the user to be updated.
    :param user_data: UserUpdate schema containing the updated user's data.
    :param current_user: User dependency to get the currently authenticated user.
    :param auth_service: AuthService dependency for user management.
    :return: UserResponse schema containing the updated user's data.
    :raises HTTPException: If the current user is not an admin or the user being updated
    is not the current user, it raises a 403 Forbidden error.
    :raises HTTPException: If the user to be updated is not found or the update fails, it raises a 404 Not Found error.
    """
    if current_user.type != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Only admins can update users")

    # 3. Obtén los datos que realmente se enviaron, omitiendo los que no (los que son None)
    update_data = user_data.dict(exclude_unset=True)

    # 4. Si se envió una nueva contraseña Y no está vacía, hasheala.
    if "password" in update_data and update_data["password"]:
        update_data["password"] = pwd_context.hash(update_data["password"])
    # Si se envió el campo "password" pero está vacío, elimínalo para no actualizarlo.
    elif "password" in update_data:
        del update_data["password"]

    # 5. Llama al servicio con solo los datos que necesitan ser actualizados.
    updated_user = await auth_service.update_user(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found or update failed")

    return UserResponse.from_orm(updated_user)
