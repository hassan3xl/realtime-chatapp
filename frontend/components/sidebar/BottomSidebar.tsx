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

export function BottomSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={cn(
        "block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border",
        "flex justify-around items-center h-14",
      )}
    >
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
            <span className="text-xs mt-1">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
