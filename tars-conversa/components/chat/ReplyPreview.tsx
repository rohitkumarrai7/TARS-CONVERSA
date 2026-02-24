"use client";

import { X, CornerUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReplyPreviewProps {
  senderName: string;
  body: string;
  onCancel: () => void;
}

export default function ReplyPreview({
  senderName,
  body,
  onCancel,
}: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-t border-border animate-fade-in">
      <CornerUpLeft className="w-4 h-4 text-indigo-400 flex-shrink-0" />

      <div className="flex-1 min-w-0 border-l-2 border-indigo-500 pl-2.5">
        <p className="text-xs font-semibold text-indigo-400 truncate">
          Replying to {senderName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {body.length > 80 ? body.slice(0, 80) + "..." : body}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Cancel reply"
        onClick={onCancel}
        className="w-6 h-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
