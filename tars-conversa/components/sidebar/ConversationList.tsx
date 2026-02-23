"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import ConversationItem from "./ConversationItem";
import ConversationSkeleton from "@/components/shared/ConversationSkeleton";
import EmptyState from "@/components/shared/EmptyState";

interface ConversationListProps {
  currentUserClerkId: string;
  selectedConversationId?: string;
  searchQuery: string;
}

export default function ConversationList({
  currentUserClerkId,
  selectedConversationId,
  searchQuery,
}: ConversationListProps) {
  const conversations = useQuery(api.conversations.getConversationsForUser, {
    clerkId: currentUserClerkId,
  });
  const router = useRouter();

  const filteredConversations = conversations?.filter((conversation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (conversation.isGroup) {
      return conversation.groupName?.toLowerCase().includes(query);
    }
    return conversation.otherUser?.name?.toLowerCase().includes(query);
  });

  return (
    <div className="flex-1 overflow-y-auto space-y-0.5 px-2 chat-scroll">
      {conversations === undefined ? (
        <ConversationSkeleton />
      ) : filteredConversations &&
        filteredConversations.length === 0 &&
        searchQuery !== "" ? (
        <EmptyState
          icon={MessageSquare}
          title="No results"
          description={`No conversations matching "${searchQuery}"`}
          className="h-48"
        />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Search for someone to start chatting"
          className="h-48"
        />
      ) : (
        filteredConversations?.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={{
              ...conversation,
              participants: conversation.participants.filter(
                (p): p is NonNullable<typeof p> => p !== null
              ),
            }}
            isActive={conversation._id === selectedConversationId}
            currentUserClerkId={currentUserClerkId}
            onClick={() => router.push(`/chat/${conversation._id}`)}
          />
        ))
      )}
    </div>
  );
}
