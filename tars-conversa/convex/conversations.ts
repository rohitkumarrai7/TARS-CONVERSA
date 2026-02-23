import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Finds an existing 1-on-1 conversation between two users,
 * or creates a new one if none exists.
 * Returns conversationId and whether it was newly created.
 */
export const getOrCreateDirectConversation = mutation({
  args: {
    currentUserClerkId: v.string(),
    otherUserClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const allConversations = await ctx.db.query("conversations").collect();

    const existing = allConversations.find(
      (c) =>
        c.isGroup === false &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(args.currentUserClerkId) &&
        c.participantIds.includes(args.otherUserClerkId)
    );

    if (existing) {
      return { conversationId: existing._id, isNew: false };
    }

    const newId = await ctx.db.insert("conversations", {
      participantIds: [args.currentUserClerkId, args.otherUserClerkId],
      isGroup: false,
      createdBy: args.currentUserClerkId,
      createdAt: Date.now(),
    });

    return { conversationId: newId, isNew: true };
  },
});

/**
 * Creates a new group conversation with a name and multiple members.
 * Creator is automatically included in participants.
 */
export const createGroupConversation = mutation({
  args: {
    creatorClerkId: v.string(),
    memberClerkIds: v.array(v.string()),
    groupName: v.string(),
    groupImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      participantIds: [args.creatorClerkId, ...args.memberClerkIds],
      isGroup: true,
      groupName: args.groupName,
      ...(args.groupImageUrl !== undefined && {
        groupImageUrl: args.groupImageUrl,
      }),
      createdBy: args.creatorClerkId,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

/**
 * Returns all conversations for a given user, enriched with:
 * - Other participant info (for DMs)
 * - All participant info (for groups)
 * - Unread message count for this user
 * Sorted by most recent message first.
 */
export const getConversationsForUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const allConversations = await ctx.db.query("conversations").collect();

    const userConversations = allConversations.filter((c) =>
      c.participantIds.includes(args.clerkId)
    );

    const enriched = await Promise.all(
      userConversations.map(async (conversation) => {
        // 1. Get all participant user records
        const participants = await Promise.all(
          conversation.participantIds.map((id) =>
            ctx.db
              .query("users")
              .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
              .unique()
          )
        );

        // 2. Identify otherUser (for DMs only)
        const otherUser = !conversation.isGroup
          ? participants.find((p) => p?.clerkId !== args.clerkId) ?? null
          : null;

        // 3. Calculate unreadCount
        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_conversation_user", (q) =>
            q
              .eq("conversationId", conversation._id)
              .eq("userId", args.clerkId)
          )
          .unique();

        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .collect();

        let unreadCount: number;
        if (readReceipt) {
          unreadCount = messages.filter(
            (msg) =>
              msg.createdAt > readReceipt.lastReadAt &&
              msg.senderId !== args.clerkId
          ).length;
        } else {
          unreadCount = messages.filter(
            (msg) => msg.senderId !== args.clerkId
          ).length;
        }

        // 4. Build return object
        return {
          _id: conversation._id,
          isGroup: conversation.isGroup,
          groupName: conversation.groupName,
          groupImageUrl: conversation.groupImageUrl,
          participantIds: conversation.participantIds,
          lastMessagePreview: conversation.lastMessagePreview,
          lastMessageTime: conversation.lastMessageTime,
          lastMessageSenderId: conversation.lastMessageSenderId,
          pinnedMessageId: conversation.pinnedMessageId,
          createdAt: conversation.createdAt,
          otherUser,
          participants: participants.filter(Boolean),
          unreadCount,
        };
      })
    );

    // Sort by lastMessageTime descending (fallback to createdAt)
    enriched.sort((a, b) => {
      const timeA = a.lastMessageTime ?? a.createdAt;
      const timeB = b.lastMessageTime ?? b.createdAt;
      return timeB - timeA;
    });

    return enriched;
  },
});

/**
 * Returns a single conversation with full participant details.
 * Returns null if not found.
 */
export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      return null;
    }

    const participants = await Promise.all(
      conversation.participantIds.map((id) =>
        ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
          .unique()
      )
    );

    return {
      ...conversation,
      participants: participants.filter(Boolean),
    };
  },
});

/**
 * Pins or unpins a message in a conversation.
 * Any participant can pin/unpin.
 */
export const updatePinnedMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    pinnedMessageId: v.optional(v.id("messages")),
    requestingUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participantIds.includes(args.requestingUserId)) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.conversationId, {
      pinnedMessageId: args.pinnedMessageId,
    });
  },
});
