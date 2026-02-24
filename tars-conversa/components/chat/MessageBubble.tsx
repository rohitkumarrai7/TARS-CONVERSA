"use client";

// Placeholder — will be fully implemented in Phase 11

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  isGroup: boolean;
  currentUserClerkId: string;
  isHighlighted: boolean;
  onReply: () => void;
  onDelete: () => Promise<void>;
  onReact: (emoji: string) => Promise<void>;
  onPin: () => Promise<void>;
}

export default function MessageBubble(_props: MessageBubbleProps) {
  return null;
}
