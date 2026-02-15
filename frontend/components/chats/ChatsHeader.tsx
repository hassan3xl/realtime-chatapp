"use client";

import { ChevronLeft, Phone, Video } from "lucide-react";
import React from "react";
import type { ChatUser } from "@/lib/api";

interface ChatHeaderProps {
  user: ChatUser;
  onBack?: () => void;
}

const ChatsHeader = ({ user, onBack }: ChatHeaderProps) => {
  const displayName = user.display_name || user.username;

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

        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">
          {user.is_bot ? "🤖" : displayName[0]?.toUpperCase()}
        </div>

        <div>
          <p className="font-semibold text-foreground">{displayName}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
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
