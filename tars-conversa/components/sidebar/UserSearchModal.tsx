"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/shared/UserAvatar";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserClerkId: string;
}

export default function UserSearchModal({
  isOpen,
  onClose,
  currentUserClerkId,
}: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Debounce searchQuery → debouncedQuery with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const users = useQuery(api.users.searchUsers, {
    searchQuery: debouncedQuery,
    currentUserClerkId,
  });

  const getOrCreate = useMutation(
    api.conversations.getOrCreateDirectConversation
  );

  const handleSelectUser = async (otherUserClerkId: string) => {
    try {
      setIsCreating(true);
      const result = await getOrCreate({
        currentUserClerkId,
        otherUserClerkId,
      });
      router.push(`/chat/${result.conversationId}`);
      onClose();
      setSearchQuery("");
    } catch {
      toast.error("Failed to open conversation");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSearchQuery("");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base font-semibold">
            New Conversation
          </DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto chat-scroll">
          {users === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No users found"
              description={
                debouncedQuery
                  ? `No one found for "${debouncedQuery}"`
                  : "No other users yet"
              }
              className="h-48"
            />
          ) : (
            <div className="p-2 space-y-0.5">
              {users.map((user) => (
                <button
                  key={user.clerkId}
                  onClick={() => handleSelectUser(user.clerkId)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left disabled:opacity-50"
                >
                  <UserAvatar
                    imageUrl={user.imageUrl}
                    name={user.name}
                    size="md"
                    showOnlineDot={true}
                    isOnline={user.isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.isOnline && (
                    <span className="text-xs text-green-500 font-medium flex-shrink-0">
                      Online
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
