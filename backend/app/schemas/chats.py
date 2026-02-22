from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from .users import UserOut

class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    pass

class MessageOut(MessageBase):
    id: UUID
    thread_id: UUID
    user: UserOut
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class ThreadBase(BaseModel):
    pass

class ThreadCreate(BaseModel):
    user_id: UUID

class LastMessage(BaseModel):
    message: str
    timestamp: datetime
    user_id: UUID

class ThreadOut(BaseModel):
    id: UUID
    first_person: UUID
    second_person: UUID
    updated: datetime
    last_message: Optional[LastMessage] = None
    model_config = ConfigDict(from_attributes=True)
Template: ThreadOut
