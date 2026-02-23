"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Manages auto-scrolling behavior for the message list.
 * - Auto-scrolls to bottom when new messages arrive
 *   IF user is already near the bottom
 * - If user has scrolled up: sets hasNewMessages=true
 *   instead of force-scrolling
 * - scrollToBottom can be called manually (e.g. from button)
 */
export function useAutoScroll(dependencyLength: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const checkIfAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distanceFromBottom < 100);
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior,
      });
      setHasNewMessages(false);
      setIsAtBottom(true);
    },
    []
  );

  // Listen to scroll events
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkIfAtBottom, { passive: true });
    return () => {
      el.removeEventListener("scroll", checkIfAtBottom);
    };
  }, [checkIfAtBottom]);

  // React to new messages arriving
  useEffect(() => {
    if (dependencyLength === 0) return;
    if (isAtBottom) {
      scrollToBottom("instant");
    } else {
      setHasNewMessages(true);
    }
  }, [dependencyLength]);

  return {
    scrollRef,
    isAtBottom,
    hasNewMessages,
    scrollToBottom,
  };
}
