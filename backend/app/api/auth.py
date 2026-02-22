from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List

from ..database import get_db
from ..models.users import User, Profile
from ..schemas.users import UserCreate, UserLogin, UserOut, UserUpdate
from ..core.security import get_password_hash, verify_password, create_access_token
from .deps import get_current_user

router = APIRouter()

@router.post("/register/", response_model=UserOut)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    if user_in.password != user_in.password2:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Check if user exists
    result = await db.execute(
        select(User).where(
            or_(User.username == user_in.username, User.phone_number == user_in.phone_number)
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this username or phone number already exists")
    
    hashed_password = get_password_hash(user_in.password)
    user = User(
        username=user_in.username,
        phone_number=user_in.phone_number,
        display_name=user_in.display_name or user_in.username,
        password=hashed_password,
    )
    db.add(user)
    await db.flush() # Get user id
    
    # Create profile
    profile = Profile(user_id=user.id)
    db.add(profile)
    
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login/")
async def login(response: Response, user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            or_(User.username == user_in.identifier, User.phone_number == user_in.identifier)
        )
    )
    user = result.scalars().first()
    
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect identifier or password")
    
    access_token = create_access_token(subject=user.id)
    
    # Set cookie for frontend compatibility
    response.set_cookie(
        key="sessionid",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7, # 7 days
        samesite="lax",
        secure=False, # Set to True in production
    )
    
    return {"detail": "Successfully logged in", "user": user}

@router.post("/logout/")
async def logout(response: Response):
    response.delete_cookie("sessionid")
    return {"detail": "Successfully logged out"}

@router.get("/me/", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/search/", response_model=List[UserOut])
async def search_users(q: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(User).where(
            or_(
                User.username.ilike(f"%{q}%"), 
                User.display_name.ilike(f"%{q}%"),
                User.phone_number.ilike(f"%{q}%")
            )
        ).limit(10)
    )
    return result.scalars().all()
