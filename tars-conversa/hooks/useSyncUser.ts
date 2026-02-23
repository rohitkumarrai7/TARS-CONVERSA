"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function useSyncUser() {
  const { user, isLoaded } = useUser();
  const createOrUpdate = useMutation(api.users.createOrUpdateUser);
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Sync user data to Convex
    createOrUpdate({
      clerkId: user.id,
      name: user.fullName ?? user.username ?? "Unknown User",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      imageUrl: user.imageUrl,
    });

    // Mark as online
    setOnlineStatus({
      clerkId: user.id,
      isOnline: true,
    });

    // Mark offline on tab close or unmount
    const handleOffline = () => {
      setOnlineStatus({
        clerkId: user.id,
        isOnline: false,
      });
    };

    window.addEventListener("beforeunload", handleOffline);

    return () => {
      window.removeEventListener("beforeunload", handleOffline);
      handleOffline();
    };
  }, [isLoaded, user?.id]);
}
