"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import MessageSearchBar from "@/components/chat/MessageSearchBar";

interface ReplyTo {
  _id: Id<"messages">;
  senderName: string;
  body: string;
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.conversationId as Id<"conversations">;

  const { user } = useUser();

  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightMessageId, setHighlightMessageId] =
    useState<Id<"messages"> | null>(null);

  const conversation = useQuery(api.conversations.getConversationById, {
    conversationId,
  });

  const handleReplyTo = useCallback((message: ReplyTo) => {
    setReplyTo(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const handleSearchResultClick = useCallback(
    (messageId: Id<"messages">) => {
      setHighlightMessageId(messageId);
      // Clear highlight after animation (1.5s)
      setTimeout(() => setHighlightMessageId(null), 1500);
    },
    []
  );

  if (!user || !conversationId) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <ChatHeader
        conversationId={conversationId}
        currentUserClerkId={user.id}
        onSearchToggle={handleSearchToggle}
        isSearchOpen={isSearchOpen}
      />

      {/* Message search bar — shown when search toggled */}
      {isSearchOpen && (
        <MessageSearchBar
          conversationId={conversationId}
          onResultClick={handleSearchResultClick}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Message list — takes all remaining space */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          conversationId={conversationId}
          currentUserClerkId={user.id}
          isGroup={conversation?.isGroup ?? false}
          onReplyTo={handleReplyTo}
          highlightMessageId={highlightMessageId}
        />
      </div>

      {/* Input — sticks to bottom */}
      <MessageInput
        conversationId={conversationId}
        currentUserClerkId={user.id}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
}
