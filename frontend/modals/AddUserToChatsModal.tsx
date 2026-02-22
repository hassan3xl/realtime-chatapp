"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, UserPlus } from "lucide-react";
import {
  searchUsers,
  createThread,
  type ApiUser,
  type Thread,
} from "@/lib/api";

type AddUserToChatsModalType = {
  onClose: () => void;
  onThreadCreated?: (thread: Thread) => void;
};

const AddUserToChatsModal = ({
  onClose,
  onThreadCreated,
}: AddUserToChatsModalType) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (q: string) => {
    setLoading(true);
    try {
      const users = await searchUsers(q);
      setResults(users || []);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: ApiUser) => {
    if (creating) return;
    setCreating(user.id);
    try {
      const thread = await createThread(user.id);
      if (onThreadCreated) {
        onThreadCreated(thread);
      } else {
        // Fallback if no handler provided (e.g. reload or just close)
        // Ideally prompt parent to refresh
      }
      onClose();
    } catch (error) {
      console.error("Failed to create thread", error);
      alert("Failed to create chat");
    } finally {
      setCreating(null);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      <div
        className="fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full h-full sm:w-96 sm:h-auto bg-card rounded-xl border border-border shadow-lg p-6 flex flex-col overflow-hidden text-card-foreground">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">New Chat</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by username..."
              className="w-full pl-9 p-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto min-h-[200px] sm:max-h-[300px]">
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                No users found.
              </p>
            )}

            {!loading && !query && (
              <p className="text-center text-muted-foreground text-sm py-4">
                Type to find people to chat with.
              </p>
            )}

            <div className="space-y-1">
              {results.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {user.display_name?.[0]?.toUpperCase() ||
                      user.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.display_name || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                  {creating === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserToChatsModal;
