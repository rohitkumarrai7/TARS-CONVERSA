import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sends a new message in a conversation.
 * Updates the conversation's last message preview and timestamp.
 * Supports optional reply threading via replyToMessageId.
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    body: v.string(),
    replyToMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    if (args.body.trim() === "") {
      throw new Error("Message cannot be empty");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      body: args.body,
      deleted: false,
      reactions: [],
      isPinned: false,
      replyToMessageId: args.replyToMessageId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.conversationId, {
      lastMessagePreview: args.body.slice(0, 60),
      lastMessageTime: Date.now(),
      lastMessageSenderId: args.senderId,
    });

    return messageId;
  },
});

/**
 * Soft deletes a message. Sets deleted=true and clears body.
 * Only the original sender can delete their own message.
 * Updates conversation preview if this was the last message.
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    requestingUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== args.requestingUserId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.patch(args.messageId, { deleted: true, body: "" });

    const conversation = await ctx.db.get(message.conversationId);

    if (
      conversation &&
      conversation.lastMessageSenderId === args.requestingUserId &&
      conversation.lastMessagePreview !== undefined
    ) {
      await ctx.db.patch(message.conversationId, {
        lastMessagePreview: "Message deleted",
      });
    }
  },
});

/**
 * Toggles a reaction emoji on a message for the given user.
 * If user already reacted with same emoji: removes their reaction.
 * If new reaction: adds it. Cleans up empty reaction objects.
 */
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const updatedReactions = [...message.reactions];
    const emojiIndex = updatedReactions.findIndex(
      (r) => r.emoji === args.emoji
    );

    if (emojiIndex !== -1) {
      const existing = updatedReactions[emojiIndex];
      const userIndex = existing.userIds.indexOf(args.userId);

      if (userIndex !== -1) {
        // User already reacted — remove them
        const newUserIds = existing.userIds.filter(
          (id) => id !== args.userId
        );
        if (newUserIds.length === 0) {
          updatedReactions.splice(emojiIndex, 1);
        } else {
          updatedReactions[emojiIndex] = {
            emoji: existing.emoji,
            userIds: newUserIds,
          };
        }
      } else {
        // User hasn't reacted with this emoji yet — add them
        updatedReactions[emojiIndex] = {
          emoji: existing.emoji,
          userIds: [...existing.userIds, args.userId],
        };
      }
    } else {
      // Emoji doesn't exist yet — create new reaction
      updatedReactions.push({
        emoji: args.emoji,
        userIds: [args.userId],
      });
    }

    await ctx.db.patch(args.messageId, { reactions: updatedReactions });
  },
});

/**
 * Returns all messages in a conversation ordered by time.
 * Enriches each message with sender info and reply context.
 */
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const enriched = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", message.senderId))
          .unique();

        let replyToBody: string | undefined;
        let replyToSenderName: string | undefined;

        if (message.replyToMessageId) {
          const repliedMessage = await ctx.db.get(message.replyToMessageId);
          if (repliedMessage) {
            replyToBody = repliedMessage.body;
            const repliedSender = await ctx.db
              .query("users")
              .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", repliedMessage.senderId)
              )
              .unique();
            replyToSenderName = repliedSender?.name ?? "Unknown";
          }
        }

        return {
          _id: message._id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          deleted: message.deleted,
          reactions: message.reactions,
          isPinned: message.isPinned,
          replyToMessageId: message.replyToMessageId,
          createdAt: message.createdAt,
          senderName: sender?.name ?? "Unknown",
          senderImageUrl: sender?.imageUrl ?? "",
          senderClerkId: message.senderId,
          replyToBody,
          replyToSenderName,
        };
      })
    );

    return enriched;
  },
});

/**
 * Marks all messages in a conversation as read for the given user.
 * Upserts the readReceipts record with current timestamp.
 */
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const latestMessage = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_createdAt", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .first();

    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastReadAt: Date.now(),
        lastReadMessageId: latestMessage?._id,
      });
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadAt: Date.now(),
        lastReadMessageId: latestMessage?._id,
      });
    }
  },
});

/**
 * Full-text search within a conversation's messages.
 * Returns non-deleted messages matching the query string.
 * Ordered newest first for display in search results.
 */
export const searchMessagesInConversation = query({
  args: {
    conversationId: v.id("conversations"),
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.searchQuery.trim().length < 2) {
      return [];
    }

    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const matching = allMessages.filter(
      (msg) =>
        !msg.deleted &&
        msg.body.toLowerCase().includes(args.searchQuery.toLowerCase())
    );

    const enriched = await Promise.all(
      matching.map(async (message) => {
        const sender = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", message.senderId))
          .unique();

        return {
          _id: message._id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          createdAt: message.createdAt,
          senderName: sender?.name ?? "Unknown",
          senderImageUrl: sender?.imageUrl ?? "",
        };
      })
    );

    enriched.sort((a, b) => b.createdAt - a.createdAt);

    return enriched;
  },
});
