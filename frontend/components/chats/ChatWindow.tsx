"use client";

import SendMessage from "../messaging/SendMessage";
import ChatsHeader from "./ChatsHeader";
import UserConversations from "./UserConversations";

interface ChatWindowProps {
  user: any;
  onBack?: () => void;
}

export default function ChatWindow({ user, onBack }: ChatWindowProps) {
  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div>
        <ChatsHeader user={user} onBack={onBack} />
      </div>

      {/* Chat messages */}
      <div className="flex-1 mt-4 overflow-y-auto">
        <UserConversations />
      </div>

      {/* send chats  */}
      <div>
        <SendMessage />
      </div>
    </div>
  );
}
