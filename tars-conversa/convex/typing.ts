import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sets or updates the typing status of a user in a conversation.
 * Upserts the record — creates if missing, updates if exists.
 */
export const setTypingStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversation_user", (q) =>
        q
          .eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typingStatus", {
        conversationId: args.conversationId,
        userId: args.userId,
        isTyping: args.isTyping,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Returns users currently typing in a conversation.
 * Excludes the current user and stale entries (older than 3s).
 */
export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const allTyping = await ctx.db
      .query("typingStatus")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const activeTyping = allTyping.filter(
      (record) =>
        record.userId !== args.currentUserId &&
        record.isTyping === true &&
        record.updatedAt > Date.now() - 3000
    );

    const typingUsers = await Promise.all(
      activeTyping.map(async (record) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", record.userId))
          .unique();

        return {
          userId: record.userId,
          name: user?.name ?? "Unknown",
        };
      })
    );

    return typingUsers;
  },
});
