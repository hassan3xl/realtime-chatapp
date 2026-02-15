"use client";

import { useState, useEffect } from "react";
import ChatsHeader from "./ChatsHeader";
import UserConversations from "./UserConversations";
import SendMessage from "../messaging/SendMessage";
import {
  getMessages,
  sendMessage as sendMessageApi,
  type Thread,
  type Message,
} from "@/lib/api";
import type { WsNewMessage } from "@/lib/useSocket";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  thread: Thread;
  onBack: () => void;
  onMessageSent?: () => void;
  sendWsMessage?: (threadId: number, message: string) => void;
  incomingMessage?: WsNewMessage["data"] | null;
  onIncomingConsumed?: () => void;
}

const ChatWindow = ({
  thread,
  onBack,
  onMessageSent,
  sendWsMessage,
  incomingMessage,
  onIncomingConsumed,
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch messages when thread changes
  useEffect(() => {
    setLoading(true);
    getMessages(thread.id)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [thread.id]);

  // Append incoming WS message if it belongs to our active thread
  useEffect(() => {
    if (!incomingMessage) return;

    if (incomingMessage.thread_id === thread.id) {
      // Convert WS message format to Message format and append
      const newMsg: Message = {
        id: incomingMessage.id,
        user: {
          ...incomingMessage.user,
          is_online: false,
          last_seen: null,
        },
        message: incomingMessage.message,
        timestamp: incomingMessage.timestamp,
      };

      setMessages((prev) => {
        // Deduplicate: don't add if already in the list
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    }

    onIncomingConsumed?.();
  }, [incomingMessage, thread.id, onIncomingConsumed]);

  const handleSend = async (text: string) => {
    const newMsg = await sendMessageApi(thread.id, text);
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
