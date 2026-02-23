import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /** Stores Clerk-synced user profiles and online presence */
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  /** Tracks 1-on-1 and group conversations between users */
  conversations: defineTable({
    participantIds: v.array(v.string()),
    isGroup: v.boolean(),
    groupName: v.optional(v.string()),
    groupImageUrl: v.optional(v.string()),
    createdBy: v.string(),
    lastMessagePreview: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastMessageSenderId: v.optional(v.string()),
    pinnedMessageId: v.optional(v.id("messages")),
    createdAt: v.number(),
  })
    .index("by_participantIds", ["participantIds"])
    .index("by_lastMessageTime", ["lastMessageTime"]),

  /** Individual chat messages with reactions, replies, and pin support */
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.string(),
    deleted: v.boolean(),
    replyToMessageId: v.optional(v.id("messages")),
    reactions: v.array(
      v.object({
        emoji: v.string(),
        userIds: v.array(v.string()),
      })
    ),
    isPinned: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_conversationId_createdAt", ["conversationId", "createdAt"]),

  /** Real-time typing indicators per conversation per user */
  typingStatus: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_conversationId", ["conversationId"]),

  /** Tracks which messages each user has read in each conversation */
  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),
    lastReadAt: v.number(),
    lastReadMessageId: v.optional(v.id("messages")),
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_conversationId", ["conversationId"]),
});
