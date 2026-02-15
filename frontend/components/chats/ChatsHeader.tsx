"use client";

import { ChevronLeft, Phone, Video } from "lucide-react";
import React from "react";
import type { ChatUser } from "@/lib/api";

interface ChatHeaderProps {
  user: ChatUser;
  onBack?: () => void;
}

function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return "offline";

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "last seen just now";
  if (diffMin < 60) return `last seen ${diffMin}m ago`;
  if (diffHr < 24) return `last seen ${diffHr}h ago`;

  return `last seen ${date.toLocaleDateString()}`;
}

const ChatsHeader = ({ user, onBack }: ChatHeaderProps) => {
  const displayName = user.display_name || user.username;
  const statusText = user.is_bot
    ? "bot"
    : user.is_online
      ? "online"
      : formatLastSeen(user.last_seen);

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 rounded-md">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Avatar with online indicator */}
        <div className="relative shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
            {user.is_bot ? "🤖" : displayName[0]?.toUpperCase()}
          </div>
          {user.is_online && !user.is_bot && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
          )}
        </div>

        <div>
          <p className="font-semibold text-foreground">{displayName}</p>
          <p
            className={`text-xs ${
              user.is_online ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {statusText}
          </p>
        </div>
      </div>

      <div className="flex gap-4 text-muted-foreground">
        <Video
          size={20}
          className="hover:text-foreground cursor-pointer transition"
        />
        <Phone
          size={20}
          className="hover:text-foreground cursor-pointer transition"
        />
      </div>
    </div>
  );
};

export default ChatsHeader;
