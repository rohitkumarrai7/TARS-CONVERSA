"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Search, Video, MoreVertical, Pin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserAvatar from "@/components/shared/UserAvatar";
import { formatLastSeen } from "@/lib/formatTimestamp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
  onSearchToggle: () => void;
  isSearchOpen: boolean;
}

export default function ChatHeader({
  conversationId,
  currentUserClerkId,
  onSearchToggle,
  isSearchOpen,
}: ChatHeaderProps) {
  const router = useRouter();

  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId,
  });

  const messages = useQuery(api.messages.getMessages, { conversationId });

  const updatePinned = useMutation(api.conversations.updatePinnedMessage);

  if (!conversation) {
    return (
      <div className="h-16 border-b border-border flex items-center px-4 shrink-0 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-muted mr-3" />
        <div className="space-y-1.5">
          <div className="w-24 h-3 bg-muted rounded" />
          <div className="w-16 h-2.5 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const isDM = !conversation.isGroup;
  const otherUser = isDM
    ? conversation.participants
        ?.filter((p): p is NonNullable<typeof p> => p !== null)
        .find((p) => p.clerkId !== currentUserClerkId)
    : null;

  const displayName = isDM
    ? (otherUser?.name ?? "Unknown")
    : (conversation.groupName ?? "Group Chat");

  const displayImage = isDM
    ? (otherUser?.imageUrl ?? "")
    : (conversation.groupImageUrl ?? "");

  const isOnline = isDM ? (otherUser?.isOnline ?? false) : false;

  const subtitle = isDM
    ? isOnline
      ? "Online"
      : otherUser?.lastSeen
        ? `Last seen ${formatLastSeen(otherUser.lastSeen)}`
        : "Offline"
    : `${conversation.participants?.length ?? 0} members`;

  // Get pinned message details
  const pinnedMessage = conversation.pinnedMessageId
    ? messages?.find((m) => m._id === conversation.pinnedMessageId)
    : null;

  const handleUnpin = async () => {
    try {
      await updatePinned({
        conversationId,
        pinnedMessageId: undefined,
        requestingUserId: currentUserClerkId,
      });
    } catch {
      toast.error("Failed to unpin message");
    }
  };

  return (
    <div className="flex flex-col shrink-0 border-b border-border">
      {/* Main header row */}
      <div className="h-16 flex items-center justify-between px-4 gap-3">
        {/* Left: back + avatar + name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Back button — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            onClick={() => router.back()}
            className="md:hidden w-8 h-8 shrink-0 -ml-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Avatar */}
          {isDM ? (
            <UserAvatar
              imageUrl={displayImage}
              name={displayName}
              size="md"
              showOnlineDot={true}
              isOnline={isOnline}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <span className="text-indigo-400 font-bold text-sm">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {/* Name + subtitle */}
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate leading-tight">
              {displayName}
            </h2>
            <p
              className={cn(
                "text-xs truncate leading-tight",
                isOnline && isDM
                  ? "text-green-500 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: action buttons */}
        <TooltipProvider>
          <div className="flex items-center gap-1 shrink-0">
            {/* Search toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search messages"
                  onClick={onSearchToggle}
                  className={cn(
                    "w-8 h-8",
                    isSearchOpen && "bg-indigo-500/10 text-indigo-400"
                  )}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search messages</TooltipContent>
            </Tooltip>

            {/* Video call (UI only) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Video call"
                  onClick={() => toast.info("Video call coming soon!")}
                  className="w-8 h-8"
                >
                  <Video className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Video call</TooltipContent>
            </Tooltip>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More options"
                  className="w-8 h-8"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => toast.info("Coming soon!")}
                >
                  View profile
                </DropdownMenuItem>
                {conversation.isGroup && (
                  <DropdownMenuItem
                    onClick={() => toast.info("Coming soon!")}
                    className="text-red-500"
                  >
                    Leave group
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      </div>

      {/* Pinned message bar */}
      {pinnedMessage && (
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border-t border-indigo-500/20 animate-fade-in">
          <Pin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-indigo-400 font-medium">
              Pinned message
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {pinnedMessage.senderName}:{" "}
              {pinnedMessage.deleted
                ? "Message deleted"
                : pinnedMessage.body}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Unpin message"
            onClick={handleUnpin}
            className="w-6 h-6 shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
