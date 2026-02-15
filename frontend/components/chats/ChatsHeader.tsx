"use client";

import { ChevronLeft, Phone, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface ChatHeaderProps {
  user: any;
  onBack?: () => void;
}

const ChatsHeader = ({ user, onBack }: ChatHeaderProps) => {
  const router = useRouter();
  const viewUser = () => {
    router.push(`/users/${user.id}`);
  };

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-[10px] rounded-md">
      <div className="flex">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden mr-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={viewUser}
        >
          <img
            src={user.image}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </div>
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
