import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Create a unique room name for the two users
        self.room_name = f"user_{self.scope['user'].id}"
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        # Logic to save to DB and broadcast to the other user goes here