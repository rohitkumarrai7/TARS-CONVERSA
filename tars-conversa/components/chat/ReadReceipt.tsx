"use client";

import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadReceiptProps {
  isRead: boolean;
  className?: string;
}

/**
 * Shows ✓ (sent) or ✓✓ (read) for own messages.
 * isRead = true  → filled double checkmark (indigo)
 * isRead = false → single checkmark (muted)
 */
export default function ReadReceipt({ isRead, className }: ReadReceiptProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      {isRead ? (
        <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
      ) : (
        <Check className="w-3.5 h-3.5 text-white/50" />
      )}
    </span>
  );
}
