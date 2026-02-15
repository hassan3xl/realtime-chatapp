"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { BottomSidebar } from "@/components/sidebar/BottomSidebar";
import { Loader2 } from "lucide-react";

/**
 * Wrapper for authenticated pages — shows sidebar and redirects
 * to /login if the user is not logged in.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto md:ml-20 transition-all duration-300">
          <div className="p-4 md:p-6 h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
