"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { MessageSquarePlus, Users2, LogOut, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/shared/ThemeToggle";
import UserAvatar from "@/components/shared/UserAvatar";
import ConversationList from "@/components/sidebar/ConversationList";
import UserSearchModal from "@/components/sidebar/UserSearchModal";
import NewGroupModal from "@/components/sidebar/NewGroupModal";
import { cn } from "@/lib/utils";
import { useSyncUser } from "@/hooks/useSyncUser";

export default function AppSidebar() {
  useSyncUser();

  const { user } = useUser();
  const { signOut } = useClerk();
  const params = useParams();
  const router = useRouter();
  const selectedConversationId =
    params?.conversationId as string | undefined;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isAIActive = params?.conversationId === undefined && typeof window !== "undefined" && window.location.pathname === "/chat/ai";

  if (!user) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-border",
        "bg-white dark:bg-zinc-950"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">TC</span>
          </div>
          <span className="font-bold text-sm tracking-tight">
            Tars-Conversa
          </span>
        </div>

        <ThemeToggle />
      </div>

      {/* ── Current User Row ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border shrink-0">
        <UserAvatar
          imageUrl={user.imageUrl}
          name={user.fullName ?? "User"}
          size="sm"
          showOnlineDot={true}
          isOnline={true}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user.fullName ?? user.username ?? "User"}
          </p>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() => signOut()}
          className="w-8 h-8 text-muted-foreground hover:text-foreground shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex gap-2 px-3 py-2.5 border-b border-border shrink-0">
        <Button
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-xs gap-1.5"
          size="sm"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          New Chat
        </Button>
        <Button
          onClick={() => setIsGroupOpen(true)}
          variant="outline"
          className="flex-1 h-8 text-xs gap-1.5"
          size="sm"
        >
          <Users2 className="w-3.5 h-3.5" />
          New Group
        </Button>
      </div>

      {/* ── Conversation Search ── */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* ── TARS AI Button ── */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <button
          onClick={() => router.push("/chat/ai")}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
            isAIActive
              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
              : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent"
          )}
        >
          <div className="w-7 h-7 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold">TARS AI</p>
            <p className="text-xs text-muted-foreground truncate">Ask me anything</p>
          </div>
        </button>
      </div>

      {/* ── Conversation List ── */}
      <ConversationList
        currentUserClerkId={user.id}
        selectedConversationId={selectedConversationId}
        searchQuery={searchQuery}
      />

      {/* ── Modals ── */}
      <UserSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currentUserClerkId={user.id}
      />
      <NewGroupModal
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
        currentUserClerkId={user.id}
      />
    </div>
  );
}
