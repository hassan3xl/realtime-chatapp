from fastapi import WebSocket
from typing import Dict, Set, List
import json
from uuid import UUID

class ConnectionManager:
    def __init__(self):
        # Maps user_id strings to their active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        await websocket.accept()
        user_id_str = str(user_id)
        if user_id_str not in self.active_connections:
            self.active_connections[user_id_str] = set()
        self.active_connections[user_id_str].add(websocket)

    def disconnect(self, user_id: UUID, websocket: WebSocket):
        user_id_str = str(user_id)
        if user_id_str in self.active_connections:
            self.active_connections[user_id_str].remove(websocket)
            if not self.active_connections[user_id_str]:
                del self.active_connections[user_id_str]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_user(self, user_id: UUID, message: dict):
        user_id_str = str(user_id)
        if user_id_str in self.active_connections:
            for connection in self.active_connections[user_id_str]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might be stale
                    pass

manager = ConnectionManager()
