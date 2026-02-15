"use client";

import { useState, useEffect } from "react";
import { HomeSidebar } from "@/components/sidebar/HomeSidebar";
import ChatWindow from "@/components/chats/ChatWindow";
import HomeNav from "@/components/navbar/HomeNav";
import { BottomSidebar } from "@/components/sidebar/BottomSidebar";
import AppShell from "@/components/AppShell";
import { getThreads, type Thread } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBack = () => setActiveThread(null);

  const refreshThreads = async () => {
    const updated = await getThreads();
    setThreads(updated);
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop sidebar: always visible from md and up */}
        <div className="hidden md:flex">
          <HomeSidebar
            threads={threads}
            loading={loading}
            onSelectThread={setActiveThread}
            activeThread={activeThread}
          />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* MOBILE: show thread list when no active thread */}
          {!activeThread && (
            <div className="md:hidden overflow-y-auto">
              <HomeNav />

              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && threads.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No conversations yet
                </p>
              )}
              {threads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  active={false}
                  onSelect={setActiveThread}
                />
              ))}
            </div>
          )}

          {/* Chat window (desktop or mobile when a thread is selected) */}
          {activeThread === null && <BottomSidebar />}

          {activeThread ? (
            <ChatWindow
              thread={activeThread}
              onBack={handleBack}
              onMessageSent={refreshThreads}
            />
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
              Select a conversation to start chatting 💬
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Thread item for mobile list ──────────────────────────────────────

function ThreadItem({
  thread,
  active,
  onSelect,
}: {
  thread: Thread;
  active: boolean;
  onSelect: (t: Thread) => void;
}) {
  const other = thread.other_user;
  const displayName = other.display_name || other.username;
  const preview = thread.last_message?.message ?? "No messages yet";

  return (
    <div
      onClick={() => onSelect(thread)}
      className={`flex items-center gap-3 cursor-pointer border-t border-border hover:bg-accent p-4 rounded-md transition ${
        active ? "bg-accent" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg shrink-0">
        {other.is_bot ? "🤖" : displayName[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground truncate">{displayName}</p>
        <p className="text-sm text-muted-foreground truncate">{preview}</p>
      </div>
    </div>
  );
}
