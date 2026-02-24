"use client";

import { useState } from "react";
import { CornerUpLeft, Trash2, Pin, MoreHorizontal, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/shared/UserAvatar";
import ReactionPicker from "./ReactionPicker";
import ReadReceipt from "./ReadReceipt";
import { formatMessageTime } from "@/lib/formatTimestamp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    body: string;
    deleted: boolean;
    senderId: string;
    senderClerkId: string;
    senderName: string;
    senderImageUrl: string;
    reactions: Reaction[];
    replyToBody?: string;
    replyToSenderName?: string;
    createdAt: number;
    isPinned: boolean;
  };
  isOwn: boolean;
  isGroup: boolean;
  currentUserClerkId: string;
  isHighlighted: boolean;
  isRead: boolean;
  onReply: () => void;
  onDelete: () => Promise<void>;
  onReact: (emoji: string) => Promise<void>;
  onPin: () => Promise<void>;
}

export default function MessageBubble({
  message,
  isOwn,
  isGroup,
  currentUserClerkId,
  isHighlighted,
  isRead,
  onReply,
  onDelete,
  onReact,
  onPin,
}: MessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleDelete = async () => {
    try {
      await onDelete();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleReact = async (emoji: string) => {
    setShowReactionPicker(false);
    try {
      await onReact(emoji);
    } catch {
      toast.error("Failed to add reaction");
    }
  };

  const handlePin = async () => {
    try {
      await onPin();
      toast.success("Message pinned");
    } catch {
      toast.error("Failed to pin message");
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 mb-1 group animate-fade-in",
        isOwn ? "flex-row-reverse" : "flex-row",
        isHighlighted && "animate-message-flash rounded-lg"
      )}
      onMouseLeave={() => setShowReactionPicker(false)}
    >
      {/* Avatar — other user only */}
      {!isOwn && (
        <div className="shrink-0 self-end mb-1">
          <UserAvatar
            imageUrl={message.senderImageUrl}
            name={message.senderName}
            size="sm"
          />
        </div>
      )}

      {/* Bubble column */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name — groups only, other users only */}
        {isGroup && !isOwn && (
          <span className="text-xs font-semibold text-indigo-400 px-1 mb-0.5 truncate max-w-full">
            {message.senderName}
          </span>
        )}

        {/* Reply context box */}
        {message.replyToBody && !message.deleted && (
          <div
            className={cn(
              "flex items-start gap-1.5 mb-1",
              "bg-black/10 dark:bg-white/5",
              "border-l-2 border-indigo-400",
              "rounded-lg px-2.5 py-1.5",
              "max-w-full",
              isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
            )}
          >
            <CornerUpLeft className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-indigo-400 truncate">
                {message.replyToSenderName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {message.replyToBody && message.replyToBody.length > 60
                  ? message.replyToBody.slice(0, 60) + "..."
                  : message.replyToBody}
              </p>
            </div>
          </div>
        )}

        {/* Main bubble */}
        <div
          className={cn(
            "relative px-3.5 py-2 rounded-2xl",
            "text-sm wrap-break-word leading-relaxed",
            isOwn
              ? "bg-indigo-500 text-white rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm",
            message.deleted && "bg-muted/50 dark:bg-muted/30"
          )}
        >
          {message.deleted ? (
            <span className="italic text-xs opacity-60">
              This message was deleted
            </span>
          ) : (
            message.body
          )}
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-xs text-muted-foreground mt-0.5 px-1",
            isOwn ? "text-right" : "text-left"
          )}
        >
          {formatMessageTime(message.createdAt)}
          {message.isPinned && (
            <span className="ml-1 text-indigo-400">· 📌</span>
          )}
          {isOwn && <ReadReceipt isRead={isRead} className="ml-1" />}
        </span>

        {/* Reactions bar */}
        {message.reactions.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1 mt-1 px-1",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            {message.reactions.map((reaction) => {
              const hasReacted = reaction.userIds.includes(currentUserClerkId);
              return (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReact(reaction.emoji)}
                  className={cn(
                    "flex items-center gap-1",
                    "text-xs px-2 py-0.5 rounded-full",
                    "border transition-all",
                    hasReacted
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                      : "bg-muted border-border hover:border-indigo-500/30"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium">{reaction.userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover action buttons */}
      {!message.deleted && (
        <div
          className={cn(
            "flex items-center gap-0.5 self-center",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-150",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* Reaction picker trigger */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Add reaction"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="w-7 h-7 rounded-full hover:bg-muted"
            >
              <SmilePlus className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
            <ReactionPicker
              visible={showReactionPicker}
              onReact={handleReact}
            />
          </div>

          {/* Reply */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reply to message"
            onClick={onReply}
            className="w-7 h-7 rounded-full hover:bg-muted"
          >
            <CornerUpLeft className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>

          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More message options"
                className="w-7 h-7 rounded-full hover:bg-muted"
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-40">
              <DropdownMenuItem onClick={handlePin}>
                <Pin className="w-3.5 h-3.5 mr-2" />
                {message.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>

              {isOwn && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
