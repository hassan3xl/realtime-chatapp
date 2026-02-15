"use client";

import { cn } from "@/lib/utils";
import HomeNav from "../navbar/HomeNav";
import { Loader2 } from "lucide-react";
import type { Thread } from "@/lib/api";

interface HomeSidebarProps {
  threads: Thread[];
  loading: boolean;
  onSelectThread: (thread: Thread) => void;
  activeThread: Thread | null;
}

export function HomeSidebar({
  threads,
  loading,
  onSelectThread,
  activeThread,
}: HomeSidebarProps) {
  return (
    <div className={cn("hidden md:flex flex-col w-72 h-full px-2 bg-card")}>
      <div>
        <HomeNav />
      </div>

      <div className="flex-1 overflow-y-auto pt-2 w-full">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && threads.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No conversations yet
          </p>
        )}

        {threads.map((thread) => {
          const other = thread.other_user;
          const displayName = other.display_name || other.username;
          const preview = thread.last_message?.message ?? "No messages yet";
          const isActive = activeThread?.id === thread.id;

          return (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={cn(
                "flex items-center gap-3 cursor-pointer border-t border-border hover:bg-accent p-3 rounded-md transition",
                isActive && "bg-accent",
              )}
            >
              {/* Avatar with online indicator */}
              <div className="relative shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {other.is_bot ? "🤖" : displayName[0]?.toUpperCase()}
                </div>
                {other.is_online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {preview}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
