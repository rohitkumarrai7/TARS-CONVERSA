"use client";

interface TypingIndicatorProps {
  typingText: string;
}

export default function TypingIndicator({ typingText }: TypingIndicatorProps) {
  if (!typingText) return null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 animate-fade-in">
      {/* Animated dots bubble */}
      <div className="flex items-center gap-1 bg-muted rounded-2xl rounded-bl-sm px-3 py-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
      </div>

      {/* Typing text */}
      <span className="text-xs text-muted-foreground italic">{typingText}</span>
    </div>
  );
}
