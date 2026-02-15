"use client";

import { useState, useEffect } from "react";
import ChatsHeader from "./ChatsHeader";
import UserConversations from "./UserConversations";
import SendMessage from "../messaging/SendMessage";
import { getMessages, sendMessage, type Thread, type Message } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  thread: Thread;
  onBack: () => void;
  onMessageSent?: () => void;
}

const ChatWindow = ({ thread, onBack, onMessageSent }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMessages(thread.id)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [thread.id]);

  const handleSend = async (text: string) => {
    const newMsg = await sendMessage(thread.id, text);
    setMessages((prev) => [...prev, newMsg]);
    onMessageSent?.();
  };

  return (
    <div className="flex flex-col h-full">
      <ChatsHeader user={thread.other_user} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <UserConversations messages={messages} thread={thread} />
        )}
      </div>

      <div className="px-4 pb-2">
        <SendMessage onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;
