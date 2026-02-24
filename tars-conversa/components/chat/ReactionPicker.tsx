"use client";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

interface ReactionPickerProps {
  visible: boolean;
  onReact: (emoji: string) => void;
}

export default function ReactionPicker({
  visible,
  onReact,
}: ReactionPickerProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-full mb-1.5 left-0 z-20 animate-fade-in">
      <div className="flex items-center gap-0.5 bg-background border border-border rounded-full shadow-lg px-2 py-1.5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => {
              e.stopPropagation();
              onReact(emoji);
            }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-full hover:bg-muted hover:scale-125 transition-all duration-150 focus:outline-none"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
