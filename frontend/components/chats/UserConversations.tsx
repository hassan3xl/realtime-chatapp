"use client";

import { useAuth } from "@/lib/AuthContext";
import type { Message, Thread } from "@/lib/api";
import { useEffect, useRef } from "react";

interface UserConversationsProps {
  messages: Message[];
  thread: Thread;
}

const UserConversations = ({ messages, thread }: UserConversationsProps) => {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No messages yet. Say hello! 👋
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => {
        const isMine = msg.user.id === user?.id;

        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            {!isMine && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold mr-2 mt-1 shrink-0">
                {msg.user.is_bot
                  ? "🤖"
                  : (msg.user.display_name ||
                      msg.user.username)[0]?.toUpperCase()}
              </div>
            )}

            <div
              className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-card text-foreground rounded-bl-none"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              <p
                className={`text-xs mt-1 ${
                  isMine
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default UserConversations;
