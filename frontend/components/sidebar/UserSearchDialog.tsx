"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus } from "lucide-react";
import {
  searchUsers,
  createThread,
  type ApiUser,
  type Thread,
} from "@/lib/api";
import { useDebounce } from "@/lib/hooks"; // Ensure hooks exists or implement debounce
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Check if Avatar exists or verify
import { ScrollArea } from "@/components/ui/scroll-area"; // Check if ScrollArea exists

interface UserSearchDialogProps {
  onThreadCreated: (thread: Thread) => void;
}

export function UserSearchDialog({ onThreadCreated }: UserSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Simple debounce implementation inside effect if hook missing
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
    setCreating(true);
    try {
      const thread = await createThread(user.id);
      onThreadCreated(thread);
      setOpen(false);
      setQuery("");
      setResults([]);
    } catch (error) {
      console.error("Failed to create thread", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-5 w-5" />
          <span className="sr-only">New Chat</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="h-[300px] overflow-y-auto border rounded-md p-2">
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {!loading && query && results.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found.
              </div>
            )}
            {!loading && !query && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type a name to search for users.
              </div>
            )}
            {results.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="flex items-center gap-3 p-3 hover:bg-accent rounded-md cursor-pointer transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {user.display_name[0]?.toUpperCase() ||
                    user.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
                <UserPlus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
