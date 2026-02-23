import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Creates a new user or updates existing user data.
 * Called on every login via Clerk webhook and useSyncUser hook.
 */
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      isOnline: false,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    });
    return userId;
  },
});

/**
 * Updates a user's online/offline status and lastSeen timestamp.
 * Called on app mount (online) and unmount/tab close (offline).
 */
export const setOnlineStatus = mutation({
  args: {
    clerkId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return null;
    }

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});

/**
 * Returns all users in the system.
 * Used for displaying user lists in search.
 */
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/**
 * Returns a single user record matching the given Clerk ID.
 * Returns null if not found.
 */
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Searches users by name, excluding the current user.
 * Case-insensitive partial match on name field.
 */
export const searchUsers = query({
  args: {
    searchQuery: v.string(),
    currentUserClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();

    return allUsers.filter((user) => {
      if (user.clerkId === args.currentUserClerkId) {
        return false;
      }
      if (args.searchQuery === "") {
        return true;
      }
      return user.name.toLowerCase().includes(args.searchQuery.toLowerCase());
    });
  },
});
