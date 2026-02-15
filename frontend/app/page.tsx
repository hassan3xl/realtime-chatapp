"use client";

import { useState } from "react";
import { HomeSidebar } from "@/components/sidebar/HomeSidebar";
import ChatWindow from "@/components/chats/ChatWindow";
import ChatUser from "@/components/chats/ChatUser";
import { users } from "@/lib/utils";
import HomeNav from "@/components/navbar/HomeNav";
import { BottomSidebar } from "@/components/sidebar/BottomSidebar";
import AppShell from "@/components/AppShell";

export default function Home() {
  const [activeUser, setActiveUser] = useState<any | null>(null);

  const handleBack = () => setActiveUser(null);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop sidebar: always visible from md and up */}
        <div className="hidden md:flex">
          <HomeSidebar
            users={users}
            onSelectUser={setActiveUser}
            activeUser={activeUser}
          />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* MOBILE: show users list when no active user */}
          {!activeUser && (
            <div className="md:hidden overflow-y-auto">
              <HomeNav />

              {users.map((user) => (
                <ChatUser
                  key={user.id}
                  user={user}
                  onSelectUser={setActiveUser}
                  active={false}
                />
              ))}
            </div>
          )}

          {/* Chat window (desktop or mobile when a user is selected) */}
          {activeUser === null && <BottomSidebar />}

          {activeUser ? (
            <ChatWindow user={activeUser} onBack={handleBack} />
          ) : (
            // Desktop placeholder when no user is selected
            <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
              Select a user to start chatting 💬
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
