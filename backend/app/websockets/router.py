from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from jose import jwt
import json
from uuid import UUID
from datetime import datetime

from ..database import get_db
from ..core.config import settings
from ..core.security import ALGORITHM
from ..models.users import User, Profile
from ..models.chats import Thread, ChatMessage
from .manager import manager

router = APIRouter()

async def get_user_from_ws(websocket: WebSocket, db: AsyncSession):
    # For WebSockets, middleware might not have processed cookies the same way
    # Or we look at headers/cookies manually
    token = websocket.cookies.get("sessionid")
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()
    except Exception:
        return None

@router.websocket("/ws/chat/")
async def websocket_endpoint(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    user = await get_user_from_ws(websocket, db)
    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect(user.id, websocket)
    
    # Set online status
    await db.execute(
        update(Profile).where(Profile.user_id == user.id).values(is_online=True)
    )
    # This was moved to inside the message handling loop to ensure it's updated on activity
    # await db.execute(
    #     update(Profile).where(Profile.user_id == user.id).values(is_online=True)
    # )
    # await db.commit()

    try:
        while True:
            # Receive messages from client (if any)
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "chat_message":
                thread_id = UUID(message_data.get("thread_id"))
                text = message_data.get("message")
                
                # Save message
                msg = ChatMessage(thread_id=thread_id, user_id=user.id, message=text)
                db.add(msg)
                
                # Update thread
                await db.execute(
                    update(Thread).where(Thread.id == thread_id).values(updated=datetime.utcnow())
                )
                # Set online status on message activity
                await db.execute(
                    update(Profile).where(Profile.user_id == user.id).values(is_online=True)
                )
                await db.commit()
                await db.refresh(msg)
                
                # Get other user
                thread_res = await db.execute(select(Thread).where(Thread.id == thread_id))
                thread = thread_res.scalars().first()
                other_user_id = thread.second_person_id if thread.first_person_id == user.id else thread.first_person_id
                
                # Broadast
                serialized = {
                    "type": "new_message",
                    "data": {
                        "id": str(msg.id),
                        "thread_id": str(thread.id),
                        "user": {
                            "id": str(user.id),
                            "username": user.username,
                            "display_name": user.display_name,
                            "is_bot": user.is_bot,
                        },
                        "message": msg.message,
                        "timestamp": msg.timestamp.isoformat(),
                    }
                }
                
                await manager.broadcast_to_user(user.id, serialized)
                await manager.broadcast_to_user(other_user_id, serialized)

                # Check for AI bot
                other_user_res = await db.execute(select(User).where(User.id == other_user_id))
                other_user = other_user_res.scalars().first()
                if other_user and other_user.is_bot:
                    # We can't use BackgroundTasks here easily as it's a websocket, 
                    # but we can just use asyncio.create_task
                    asyncio.create_task(handle_bot_response(thread.id, text))
                
    except WebSocketDisconnect:
        manager.disconnect(user.id, websocket)
        # Set offline status
        await db.execute(
            update(Profile).where(Profile.user_id == user.id).values(is_online=False, last_seen=datetime.utcnow())
        )
        await db.commit()
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(user.id, websocket)
