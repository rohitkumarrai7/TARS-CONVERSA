"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatMessageTime } from "@/lib/formatTimestamp";
import { cn } from "@/lib/utils";

interface MessageSearchBarProps {
  conversationId: Id<"conversations">;
  onResultClick: (messageId: Id<"messages">) => void;
  onClose: () => void;
}

export default function MessageSearchBar({
  conversationId,
  onResultClick,
  onClose,
}: MessageSearchBarProps) {
  const [query, setQuery] = useState("");

  const results = useQuery(
    api.messages.searchMessagesInConversation,
    query.trim().length >= 2
      ? { conversationId, searchQuery: query.trim() }
      : "skip"
  );

  return (
    <div className="flex flex-col border-b border-border bg-background animate-fade-in">
      {/* Search input row */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages…"
          className="flex-1 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuery("")}
            className="w-6 h-6 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 text-xs text-muted-foreground shrink-0"
        >
          Cancel
        </Button>
      </div>

      {/* Results */}
      {query.trim().length >= 2 && (
        <div className="max-h-64 overflow-y-auto border-t border-border chat-scroll">
          {results === undefined ? (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              No messages found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((msg) => (
              <button
                key={msg._id}
                onClick={() => {
                  onResultClick(msg._id);
                  onClose();
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5",
                  "hover:bg-muted/60 transition-colors",
                  "flex flex-col gap-0.5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-indigo-400 truncate">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground truncate">{msg.body}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
