from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    phone_number: str
    display_name: str
    is_bot: bool = False

class UserCreate(UserBase):
    password: str
    password2: str

class UserLogin(BaseModel):
    identifier: str # phone_number or username
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None

class UserOut(UserBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ProfileOut(BaseModel):
    avatar: str
    bio: str
    is_online: bool
    last_seen: datetime
    is_private: bool
    model_config = ConfigDict(from_attributes=True)
