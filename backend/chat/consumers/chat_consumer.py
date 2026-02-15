import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Single WebSocket endpoint per user.
    Handles:
      - Real-time message delivery between users
      - Online/offline status broadcasting
    """

    async def connect(self):
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            # Accept then close with a specific code so the client knows not to retry
            await self.accept()
            await self.close(code=4001)
            return

        self.user = user
        self.room_name = f"user_{user.id}"

        # Join user's personal group
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # Mark user online
        await self.set_online_status(True)

        # Broadcast online status to contacts
        await self.broadcast_status(True)

    async def disconnect(self, close_code):
        if hasattr(self, "user"):
            # Mark user offline + update last_seen
            await self.set_online_status(False)
            await self.broadcast_status(False)

            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        """
        Client sends: { "type": "chat_message", "thread_id": 1, "message": "Hello" }
        """
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "chat_message":
            thread_id = data.get("thread_id")
            message_text = data.get("message", "").strip()

            if not thread_id or not message_text:
                return

            # Save to DB and get serialized message
            result = await self.save_message(thread_id, message_text)
            if not result:
                return

            saved_msg, other_user_id = result

            # Send to the other user's group
            await self.channel_layer.group_send(
                f"user_{other_user_id}",
                {
                    "type": "chat.message",
                    "data": saved_msg,
                },
            )

            # Also echo back to sender
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "chat.message",
                    "data": saved_msg,
                },
            )

    # ─── Handlers for group_send ──────────────────────────────────────

    async def chat_message(self, event):
        """Receives a message from the channel layer and sends to WebSocket."""
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "data": event["data"],
        }))

    async def user_status(self, event):
        """Receives a status update and sends to WebSocket."""
        await self.send(text_data=json.dumps({
            "type": "user_status",
            "data": event["data"],
        }))

    # ─── Database helpers ─────────────────────────────────────────────

    @database_sync_to_async
    def set_online_status(self, is_online):
        from core.models import Profile
        profile, _ = Profile.objects.get_or_create(user=self.user)
        profile.is_online = is_online
        if not is_online:
            profile.last_seen = timezone.now()
        profile.save(update_fields=["is_online", "last_seen"])

    @database_sync_to_async
    def save_message(self, thread_id, message_text):
        from chat.models.chats import Thread, ChatMessage

        try:
            thread = Thread.objects.get(id=thread_id)
        except Thread.DoesNotExist:
            return None

        # Verify user is participant
        if self.user not in (thread.first_person, thread.second_person):
            return None

        msg = ChatMessage.objects.create(
            thread=thread,
            user=self.user,
            message=message_text,
        )
        thread.save()  # Update the thread timestamp

        other_user = (
            thread.second_person if thread.first_person == self.user
            else thread.first_person
        )

        serialized = {
            "id": msg.id,
            "thread_id": thread.id,
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "display_name": self.user.display_name,
                "is_bot": self.user.is_bot,
            },
            "message": msg.message,
            "timestamp": msg.timestamp.isoformat(),
        }

        return serialized, other_user.id

    async def broadcast_status(self, is_online):
        """Broadcast online/offline status to all threads' other users."""
        thread_partner_ids = await self.get_thread_partner_ids()

        status_data = {
            "user_id": self.user.id,
            "is_online": is_online,
            "last_seen": timezone.now().isoformat() if not is_online else None,
        }

        for partner_id in thread_partner_ids:
            await self.channel_layer.group_send(
                f"user_{partner_id}",
                {
                    "type": "user.status",
                    "data": status_data,
                },
            )

    @database_sync_to_async
    def get_thread_partner_ids(self):
        from chat.models.chats import Thread
        from django.db.models import Q

        threads = Thread.objects.filter(
            Q(first_person=self.user) | Q(second_person=self.user)
        )

        partner_ids = set()
        for t in threads:
            partner = t.second_person_id if t.first_person_id == self.user.id else t.first_person_id
            partner_ids.add(partner)

        return list(partner_ids)