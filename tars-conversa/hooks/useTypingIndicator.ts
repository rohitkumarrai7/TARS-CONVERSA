"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Returns a human-readable string describing who is
 * currently typing in a conversation.
 * Examples:
 *   "Alex is typing..."
 *   "Alex and Sarah are typing..."
 *   "Several people are typing..."
 *   "" (empty string when no one is typing)
 */
export function useTypingIndicator(
  conversationId: Id<"conversations">,
  currentUserId: string
) {
  const typingUsers =
    useQuery(api.typing.getTypingUsers, {
      conversationId,
      currentUserId,
    }) ?? [];

  let typingText = "";

  if (typingUsers.length === 1) {
    typingText = `${typingUsers[0].name} is typing...`;
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
  } else if (typingUsers.length > 2) {
    typingText = "Several people are typing...";
  }

  return { typingText, typingUsers };
}
