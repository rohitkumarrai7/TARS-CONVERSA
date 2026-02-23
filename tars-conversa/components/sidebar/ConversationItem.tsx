"use client";

import { cn } from "@/lib/utils";
import UserAvatar from "@/components/shared/UserAvatar";
import { Users2 } from "lucide-react";
import { formatConversationTime } from "@/lib/formatTimestamp";

interface ConversationItemProps {
  conversation: {
    _id: string;
    isGroup: boolean;
    groupName?: string;
    groupImageUrl?: string;
    lastMessagePreview?: string;
    lastMessageTime?: number;
    lastMessageSenderId?: string;
    pinnedMessageId?: string;
    createdAt: number;
    otherUser?: {
      clerkId: string;
      name: string;
      imageUrl: string;
      isOnline: boolean;
      lastSeen: number;
    } | null;
    participants: Array<{
      clerkId: string;
      name: string;
      imageUrl: string;
      isOnline: boolean;
    }>;
    unreadCount: number;
  };
  isActive: boolean;
  currentUserClerkId: string;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  currentUserClerkId,
  onClick,
}: ConversationItemProps) {
  const displayName = conversation.isGroup
    ? conversation.groupName ?? "Group Chat"
    : conversation.otherUser?.name ?? "Unknown";

  const displayImage = conversation.isGroup
    ? conversation.groupImageUrl ?? ""
    : conversation.otherUser?.imageUrl ?? "";

  const isOnline =
    !conversation.isGroup && (conversation.otherUser?.isOnline ?? false);

  let previewText: string;
  let isDeletedPreview = false;

  if (!conversation.lastMessagePreview) {
    previewText = conversation.isGroup
      ? `${conversation.participants.length} members`
      : "Start a conversation";
  } else if (conversation.lastMessagePreview === "Message deleted") {
    previewText = "Message deleted";
    isDeletedPreview = true;
  } else if (conversation.lastMessageSenderId === currentUserClerkId) {
    previewText = "You: " + conversation.lastMessagePreview;
  } else {
    previewText = conversation.lastMessagePreview;
  }

  const timeDisplay = conversation.lastMessageTime
    ? formatConversationTime(conversation.lastMessageTime)
    : formatConversationTime(conversation.createdAt);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-3",
        "rounded-lg cursor-pointer transition-all",
        "hover:bg-muted/60",
        isActive && "bg-indigo-500/10 border-l-4 border-indigo-500"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {conversation.isGroup ? (
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Users2 className="w-5 h-5 text-indigo-400" />
          </div>
        ) : (
          <UserAvatar
            imageUrl={displayImage}
            name={displayName}
            size="md"
            showOnlineDot={true}
            isOnline={isOnline}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {timeDisplay}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span
            className={cn(
              "text-xs text-muted-foreground truncate",
              isDeletedPreview && "italic"
            )}
          >
            {previewText}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {conversation.unreadCount > 99
                ? "99+"
                : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
