"use client";

import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, User, Bell, Shield } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator"; // Check if separator exists, otherwise use hr

export default function SettingsPage() {
  const { logout, user } = useAuth();

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Account Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" /> Account
          </h2>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile</p>
                <p className="text-sm text-muted-foreground">
                  Manage your public profile
                </p>
              </div>
              <Link href="/profile">
                <Button variant="outline">View Profile</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sun className="h-5 w-5 hidden dark:block" />
            <Moon className="h-5 w-5 block dark:hidden" />
            {/* Wait, icons logic above is confusing. Just use a generic icon or ModeToggle handles it. */}
            Appearance
          </h2>
          <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Customize interface theme
              </p>
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Notifications Section (Mock) */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </h2>
          <div className="bg-card border rounded-lg p-4 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive messages when offline
                </p>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy Section (Mock) */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" /> Privacy
          </h2>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Blocked Users</p>
                <p className="text-sm text-muted-foreground">
                  Manage blocked contacts
                </p>
              </div>
              <Button variant="outline" disabled>
                Manage
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper icons
import { Sun, Moon } from "lucide-react";
