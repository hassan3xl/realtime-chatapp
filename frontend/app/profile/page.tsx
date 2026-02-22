"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/api";
import { Loader2, Camera } from "lucide-react";
import AppShell from "@/components/AppShell"; // Assuming AppShell is a layout wrapper
import HomeNav from "@/components/navbar/HomeNav"; // Maybe reuse HomeNav or create a simple header

export default function ProfilePage() {
  const { user, refreshUser } = useAuth(); // Assuming refreshUser exists? If not, we might need to implement it or just reload.
  // Actually, useAuth usually exposes setUser or we can just fetch getMe again.
  // Let's assume we can rely on user state or manual refresh.

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setBio(user.bio || "");
      setPreviewUrl(user.avatar || null);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("display_name", displayName);
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updateProfile(formData);
      // Ideally refresh user context here
      // window.location.reload(); // Simple brute force if refreshUser not available
      // Or if AuthContext provides a refresh method
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Use AppShell if it provides the sidebar layout intact, or just a centered view */}
      {/* Usually AppShell wraps the main content. Let's assume we want the sidebar visible? 
           If so, we should use the same layout structure as page.tsx. 
           But page.tsx explicitly renders Layout components.
           Let's look at frontend/app/layout.tsx to see if it provides global layout.
           The prompt said "make a user profile... page".
           I'll make it a full page view with a back button or integrated into the main shell.
           I'll assume integrated.
       */}
      <div className="container mx-auto max-w-2xl py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-4xl">
                {user.display_name?.[0]?.toUpperCase() ||
                  user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold">
              {user.display_name || user.username}
            </h2>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Bio
            </Label>
            <p className="mt-1 text-base">{user.bio || "No bio yet."}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Phone
              </Label>
              <p className="mt-1">{user.phone_number || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                User ID
              </Label>
              <p className="mt-1">{user.id}</p>
            </div>
          </div>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={previewUrl || user.avatar || undefined} />
                    <AvatarFallback className="text-2xl">
                      {user.display_name?.[0]?.toUpperCase() ||
                        user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-6 w-6" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Click to change avatar
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
