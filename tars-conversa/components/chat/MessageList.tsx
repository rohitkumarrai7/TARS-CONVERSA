"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageCircle } from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { formatDateDivider } from "@/lib/formatTimestamp";
import EmptyState from "@/components/shared/EmptyState";
import MessageSkeleton from "@/components/shared/MessageSkeleton";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import NewMessagesButton from "./NewMessagesButton";

interface MessageListProps {
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
  isGroup: boolean;
  onReplyTo: (message: any) => void;
  highlightMessageId?: Id<"messages"> | null;
}

export default function MessageList({
  conversationId,
  currentUserClerkId,
  isGroup,
  onReplyTo,
  highlightMessageId,
}: MessageListProps) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const readReceipts = useQuery(api.messages.getReadReceipts, { conversationId });

  const markRead = useMutation(api.messages.markMessagesAsRead);
  const addReaction = useMutation(api.messages.addReaction);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const updatePinned = useMutation(api.conversations.updatePinnedMessage);

  const { scrollRef, hasNewMessages, scrollToBottom } = useAutoScroll(
    messages?.length ?? 0
  );

  const { typingText } = useTypingIndicator(conversationId, currentUserClerkId);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    markRead({ conversationId, userId: currentUserClerkId });
  }, [conversationId, messages?.length]);

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages ?? []);

  if (messages === undefined) {
    return <MessageSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="Be the first to say hello! 👋"
      />
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto px-4 py-4 space-y-1 chat-scroll"
      >
        {groupedMessages.map(({ date, messages: msgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground px-2 flex-shrink-0">
                {date}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Messages for this date */}
            {msgs.map((message) => {
              // isRead: another user has read up to or past this message's timestamp
              const isRead = (readReceipts ?? []).some(
                (r) =>
                  r.userId !== currentUserClerkId &&
                  r.lastReadAt >= message.createdAt
              );
              return (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderClerkId === currentUserClerkId}
                isGroup={isGroup}
                currentUserClerkId={currentUserClerkId}
                isHighlighted={message._id === highlightMessageId}
                isRead={isRead}
                onReply={() => onReplyTo(message)}
                onDelete={async () => {
                  try {
                    await deleteMessage({
                      messageId: message._id,
                      requestingUserId: currentUserClerkId,
                    });
                  } catch {
                    // handled in MessageBubble
                  }
                }}
                onReact={async (emoji) => {
                  try {
                    await addReaction({
                      messageId: message._id,
                      userId: currentUserClerkId,
                      emoji,
                    });
                  } catch {
                    // handled silently
                  }
                }}
                onPin={async () => {
                  try {
                    await updatePinned({
                      conversationId,
                      pinnedMessageId: message._id,
                      requestingUserId: currentUserClerkId,
                    });
                  } catch {
                    // handled silently
                  }
                }}
              />
              );
            })}
          </div>
        ))}

        {/* Typing indicator at the bottom */}
        <TypingIndicator typingText={typingText} />

        {/* Scroll anchor */}
        <div />
      </div>

      {/* New messages floating button */}
      {hasNewMessages && (
        <NewMessagesButton onClick={() => scrollToBottom()} />
      )}
    </div>
  );
}

// Helper: group messages by calendar date
function groupMessagesByDate(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = [];

  messages.forEach((message) => {
    const dateLabel = formatDateDivider(message.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === dateLabel) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date: dateLabel, messages: [message] });
    }
  });

  return groups;
}
