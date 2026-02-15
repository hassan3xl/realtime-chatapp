"use client";

import React from "react";

interface ChatUserProps {
  user: any;
  onSelectUser?: (user: any) => void;
  active?: boolean;
}

const ChatUser = ({ user, onSelectUser, active }: ChatUserProps) => {
  return (
    <div
      onClick={() => onSelectUser?.(user)}
      className={`flex my-2 cursor-pointer border-t border-border hover:bg-accent p-4 rounded-md transition ${
        active ? "bg-accent" : ""
      }`}
    >
      <img
        src={user.image}
        alt={user.name}
        className="rounded-full h-12 w-12 object-cover"
      />
      <div className="ml-3 mt-1">
        <p className="text-md font-bold text-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.username}</p>
      </div>
    </div>
  );
};

export default ChatUser;
