"use client";

import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import ChatUser from "../chats/ChatUser";
import HomeNav from "../navbar/HomeNav";

interface User {
  id: number;
  name: string;
  username: string;
  image: string;
}

interface HomeSidebarProps {
  users: User[];
  onSelectUser: (user: User) => void;
  activeUser: User | null;
}

export function HomeSidebar({
  users,
  onSelectUser,
  activeUser,
}: HomeSidebarProps) {
  return (
    <div className={cn("hidden md:flex flex-col w-72 h-full px-2 bg-card")}>
      {/* Sidebar header */}
      <div>
        <HomeNav />
      </div>

      {/* Chat users list */}
      <div className="flex-1 overflow-y-auto pt-4 w-full">
        {users.map((user) => (
          <ChatUser
            key={user.id}
            user={user}
            active={activeUser?.id === user.id}
            onSelectUser={onSelectUser}
          />
        ))}
      </div>
    </div>
  );
}
