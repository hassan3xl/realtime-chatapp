import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from ..database import SessionLocal
from ..models.users import User
from ..models.chats import Thread, ChatMessage
from ..services.gemini import GeminiBot
from ..websockets.manager import manager

async def handle_bot_response(thread_id: UUID, user_message_text: str):
    """
    Background task to generate and send AI response.
    """
    async with SessionLocal() as db:
        try:
            # Re-fetch thread
            thread_res = await db.execute(
                select(Thread).where(Thread.id == thread_id)
            )
            thread = thread_res.scalars().first()
            if not thread:
                return

            # Determine bot user
            # We need to load users manually as relationships might not be loaded
            user1_res = await db.execute(select(User).where(User.id == thread.first_person_id))
            user1 = user1_res.scalars().first()
            user2_res = await db.execute(select(User).where(User.id == thread.second_person_id))
            user2 = user2_res.scalars().first()

            bot_user = user1 if user1.is_bot else user2
            human_user = user2 if user1.is_bot else user1
            
            if not bot_user.is_bot:
                return

            # Fetch history
            msgs_res = await db.execute(
                select(ChatMessage)
                .where(ChatMessage.thread_id == thread_id)
                .order_by(ChatMessage.timestamp.desc())
                .limit(10)
            )
            messages = msgs_res.scalars().all()
            messages.reverse() # asc order

            history = []
            for m in messages:
                # We need to know if the message user is bot
                # For simplicity, we assume we know who is who from above
                role = 'model' if m.user_id == bot_user.id else 'user'
                history.append({'role': role, 'message': m.message})

            # Generate response
            bot = GeminiBot()
            response_text = await asyncio.to_thread(bot.generate_response, history)

            # Save bot message
            msg = ChatMessage(
                thread_id=thread_id,
                user_id=bot_user.id,
                message=response_text
            )
            db.add(msg)
            await db.commit()
            await db.refresh(msg)

            # Broadcast via WebSocket
            serialized = {
                "type": "new_message",
                "data": {
                    "id": str(msg.id),
                    "thread_id": str(thread.id),
                    "user": {
                        "id": str(bot_user.id),
                        "username": bot_user.username,
                        "display_name": bot_user.display_name,
                        "is_bot": True,
                    },
                    "message": msg.message,
                    "timestamp": msg.timestamp.isoformat(),
                }
            }

            await manager.broadcast_to_user(human_user.id, serialized)
            await manager.broadcast_to_user(bot_user.id, serialized) # For multi-device
            
        except Exception as e:
            print(f"Error in bot response task: {e}")
