"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { HomeSidebar } from "@/components/sidebar/HomeSidebar";
import ChatWindow from "@/components/chats/ChatWindow";
import HomeNav from "@/components/navbar/HomeNav";
import { BottomSidebar } from "@/components/sidebar/BottomSidebar";
import AppShell from "@/components/AppShell";
import { getThreads, type Thread } from "@/lib/api";
import {
  useSocket,
  type WsNewMessage,
  type WsUserStatus,
} from "@/lib/useSocket";
import { useAuth } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [incomingMessage, setIncomingMessage] = useState<
    WsNewMessage["data"] | null
  >(null);
  const activeThreadRef = useRef(activeThread);
  activeThreadRef.current = activeThread;

  // ─── WebSocket callbacks ──────────────────────────────────────────

  const handleWsMessage = useCallback(
    (event: WsNewMessage) => {
      const msg = event.data;

      // Skip messages sent by ourselves (already added via REST response)
      if (msg.user.id === user?.id) {
        // Still refresh thread list for ordering
        getThreads().then(setThreads).catch(console.error);
        return;
      }

      // Push the incoming message to ChatWindow if it's for the active thread
      setIncomingMessage(msg);

      // Refresh thread list to update last_message + ordering
      getThreads().then(setThreads).catch(console.error);
    },
    [user?.id],
  );

  const handleStatusChange = useCallback((event: WsUserStatus) => {
    const { user_id, is_online, last_seen } = event.data;

    // Update the other_user status in threads
    setThreads((prev) =>
      prev.map((t) =>
        t.other_user.id === user_id
          ? {
              ...t,
              other_user: { ...t.other_user, is_online, last_seen },
            }
          : t,
      ),
    );

    // Also update active thread if it matches
    setActiveThread((prev) =>
      prev && prev.other_user.id === user_id
        ? {
            ...prev,
            other_user: { ...prev.other_user, is_online, last_seen },
          }
        : prev,
    );
  }, []);

  const { connected, sendWsMessage } = useSocket({
    onMessage: handleWsMessage,
    onStatusChange: handleStatusChange,
  });

  // ─── Initial thread fetch ─────────────────────────────────────────

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

  const handleThreadCreated = (newThread: Thread) => {
    setThreads((prev) => {
      if (prev.find((t) => t.id === newThread.id)) return prev;
      return [newThread, ...prev];
    });
    setActiveThread(newThread);
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <HomeSidebar
            threads={threads}
            loading={loading}
            onSelectThread={setActiveThread}
            activeThread={activeThread}
            onThreadCreated={handleThreadCreated}
          />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* MOBILE: thread list when no active thread */}
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

          {activeThread === null && <BottomSidebar />}

          {activeThread ? (
            <ChatWindow
              thread={activeThread}
              onBack={handleBack}
              onMessageSent={refreshThreads}
              sendWsMessage={sendWsMessage}
              incomingMessage={incomingMessage}
              onIncomingConsumed={() => setIncomingMessage(null)}
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
      className={`flex items-center gap-3 cursor-pointer hover:bg-accent p-4 rounded-md transition ${
        active ? "bg-accent" : ""
      }`}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg">
          {other.is_bot ? "🤖" : displayName[0]?.toUpperCase()}
        </div>
        {other.is_online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground truncate">{displayName}</p>
        <p className="text-sm text-muted-foreground truncate">{preview}</p>
      </div>
    </div>
  );
}
