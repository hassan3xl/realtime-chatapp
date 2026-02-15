"use client";

import AddUserToChatsModal from "@/modals/AddUserToChatsModal";
import {
  ArchiveIcon,
  GitPullRequestDraft,
  MessageCircleCode,
  MoreVertical,
  PlusIcon,
  SearchIcon,
  Users,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/lib/AuthContext";

const HomeNav = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const [showAddUser, setShowAddUser] = React.useState(false);
  const { logout } = useAuth();

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      setShowOptions(false);
    }
    if (showOptions) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [showOptions]);

  const closeModal = () => {
    setShowOptions(false);
    setShowAddUser(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="relative z-20 flex border border-border rounded-md px-4 w-full top-0 mx-auto justify-between py-4 bg-card">
        <div className="flex">
          <p className="text-xl font-semibold text-foreground">ChatApp</p>
        </div>
        <div className="flex items-center relative">
          {/* Plus icon */}
          <span className="mr-4 sm:mr-0 rounded-md hover:bg-accent p-1 relative">
            <PlusIcon
              onClick={(e) => {
                e.stopPropagation();
                setShowAddUser(!showAddUser);
              }}
              className="cursor-pointer text-foreground"
            />
            {showAddUser && (
              <>
                <div
                  onClick={() => setShowAddUser(false)}
                  className="fixed inset-0 bg-black/40 z-40"
                ></div>
                <AddUserToChatsModal onClose={closeModal} />
              </>
            )}
          </span>

          {/* More Options */}
          <span
            className="hover:bg-accent rounded-md p-1 relative"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions((val) => !val);
            }}
          >
            <MoreVertical className="cursor-pointer text-foreground" />
            {showOptions && (
              <div
                className="absolute right-0 mt-2 sm:mt-1 w-36 bg-card border border-border rounded-md shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href="/groups">
                  <button className="w-full text-left px-4 py-2 hover:bg-accent text-foreground text-sm">
                    New Group
                  </button>
                </Link>
                <Link href="/groups">
                  <button className="w-full text-left px-4 py-2 hover:bg-accent text-foreground text-sm">
                    Join Group
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="w-full text-left px-4 py-2 hover:bg-accent text-foreground text-sm">
                    Settings
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-accent text-destructive text-sm flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </span>
        </div>
      </div>
      <div className="flex gap-2 h-16 items-center justify-center">
        <input
          type="text"
          placeholder="Search users..."
          className="p-2 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md w-full focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="border border-input p-2 rounded-md text-foreground hover:bg-accent transition">
          <SearchIcon />
        </button>
      </div>
      <div className="flex mt-2 gap-2 justify-between px-4 text-muted-foreground">
        <span className="hover:text-foreground transition cursor-pointer">
          <MessageCircleCode />
        </span>
        <span className="hover:text-foreground transition cursor-pointer">
          <GitPullRequestDraft />
        </span>
        <span className="hover:text-foreground transition cursor-pointer">
          <ArchiveIcon />
        </span>
        <span className="hover:text-foreground transition cursor-pointer">
          <Users />
        </span>
      </div>
    </>
  );
};

export default HomeNav;
