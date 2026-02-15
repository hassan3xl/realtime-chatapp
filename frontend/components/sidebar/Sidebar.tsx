"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Users, User, Settings } from "lucide-react";

const menuItems = [
  { href: "/", label: "Chats", icon: MessageSquare },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        "hidden md:block fixed left-0 top-0 z-50 h-full w-20 border-r border-border bg-card",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto pt-4">
          <nav className="space-y-6 mt-6">
            {menuItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  aria-label={label}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-full text-sm focus:outline-none transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={22} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
