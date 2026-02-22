from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from typing import List
from uuid import UUID

from ..database import get_db
from ..models.users import User
from ..models.chats import Thread, ChatMessage
from ..schemas.chats import ThreadOut, MessageOut, ThreadCreate, MessageCreate
from .deps import get_current_user
from ..websockets.manager import manager
from ..services.tasks import handle_bot_response

router = APIRouter()

@router.get("/threads/", response_model=List[ThreadOut])
async def get_threads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Thread).where(
            or_(Thread.first_person_id == current_user.id, Thread.second_person_id == current_user.id)
        ).order_by(desc(Thread.updated))
    )
    threads = result.scalars().all()
    
    # TODO: Populate last_message efficiently if needed
    # For now, ThreadOut schema might need adjustment or we do a subquery
    return threads

@router.post("/threads/", response_model=ThreadOut)
async def create_thread(
    thread_in: ThreadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if thread already exists
    result = await db.execute(
        select(Thread).where(
            or_(
                (Thread.first_person_id == current_user.id) & (Thread.second_person_id == thread_in.user_id),
                (Thread.first_person_id == thread_in.user_id) & (Thread.second_person_id == current_user.id)
            )
        )
    )
    thread = result.scalars().first()
    
    if not thread:
        # Check if other user exists
        other_user_res = await db.execute(select(User).where(User.id == thread_in.user_id))
        other_user = other_user_res.scalars().first()
        if not other_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        thread = Thread(
            first_person_id=current_user.id,
            second_person_id=thread_in.user_id
        )
        db.add(thread)
        await db.commit()
        await db.refresh(thread)
        
    return thread

@router.get("/threads/{thread_id}/messages/", response_model=List[MessageOut])
async def get_messages(
    thread_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify access
    thread_res = await db.execute(select(Thread).where(Thread.id == thread_id))
    thread = thread_res.scalars().first()
    if not thread or current_user.id not in [thread.first_person_id, thread.second_person_id]:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.thread_id == thread_id).order_by(ChatMessage.timestamp.asc())
    )
    return result.scalars().all()

@router.post("/threads/{thread_id}/messages/", response_model=MessageOut)
async def send_message(
    thread_id: UUID,
    message_in: MessageCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    thread_res = await db.execute(select(Thread).where(Thread.id == thread_id))
    thread = thread_res.scalars().first()
    if not thread or current_user.id not in [thread.first_person_id, thread.second_person_id]:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    message = ChatMessage(
        thread_id=thread_id,
        user_id=current_user.id,
        message=message_in.message
    )
    db.add(message)
    
    # Update thread timestamp
    thread.updated = datetime.utcnow()
    
    await db.commit()
    await db.refresh(message)
    
    # WebSocket broadcast
    serialized = {
        "type": "new_message",
        "data": {
            "id": str(message.id),
            "thread_id": str(thread.id),
            "user": {
                "id": str(current_user.id),
                "username": current_user.username,
                "display_name": current_user.display_name,
                "is_bot": current_user.is_bot,
            },
            "message": message.message,
            "timestamp": message.timestamp.isoformat(),
        }
    }
    await manager.broadcast_to_user(thread.first_person_id, serialized)
    await manager.broadcast_to_user(thread.second_person_id, serialized)
    
    # Trigger AI response
    other_user_id = thread.second_person_id if thread.first_person_id == current_user.id else thread.first_person_id
    other_user_res = await db.execute(select(User).where(User.id == other_user_id))
    other_user = other_user_res.scalars().first()
    
    if other_user and other_user.is_bot:
        background_tasks.add_task(handle_bot_response, thread.id, message_in.message)
    
    return message
