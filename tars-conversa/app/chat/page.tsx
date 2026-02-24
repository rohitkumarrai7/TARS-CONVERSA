"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserSearchModal from "@/components/sidebar/UserSearchModal";

export default function ChatPage() {
  const { user } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const allUsers = useQuery(api.users.getAllUsers);
  const onlineCount = allUsers?.filter((u) => u.isOnline).length ?? 0;
  const totalUsers = allUsers?.length ?? 0;

  return (
    <>
      {/* Hidden on mobile (sidebar shows instead) */}
      <div className="hidden md:flex h-full flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-background to-background pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8 max-w-md">
          {/* Large TC Logo */}
          <div className="w-24 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/25">
            <span className="text-white font-bold text-4xl">TC</span>
          </div>

          {/* Brand text */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Tars-Conversa
            </h1>
            <p className="text-muted-foreground text-lg">
              Conversations that connect.
            </p>
          </div>

          {/* Live stats */}
          <div className="flex items-center gap-6 py-3 px-6 bg-muted/50 rounded-2xl border border-border">
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-lg">{onlineCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="font-bold text-lg block">{totalUsers}</span>
              <p className="text-xs text-muted-foreground">Total users</p>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => setIsSearchOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 h-11 text-base gap-2 rounded-xl shadow-lg shadow-indigo-500/25"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Start a Conversation
          </Button>

          <p className="text-xs text-muted-foreground">
            Welcome back, {user?.firstName ?? "there"} 👋
          </p>
        </div>
      </div>

      {/* UserSearchModal */}
      {user && (
        <UserSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          currentUserClerkId={user.id}
        />
      )}
    </>
  );
}
