"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReplyPreview from "./ReplyPreview";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EMOJI_LIST = [
  "😀","😂","😍","🥰","😎","🤔","😅","😭",
  "👍","👎","❤️","🔥","🎉","💯","🙏","😊",
  "🤣","😢","😡","🤯","👏","💪","🚀","✨",
];

interface ReplyTo {
  _id: Id<"messages">;
  senderName: string;
  body: string;
}

interface MessageInputProps {
  conversationId: Id<"conversations">;
  currentUserClerkId: string;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
}

export default function MessageInput({
  conversationId,
  currentUserClerkId,
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTypingStatus = useMutation(api.typing.setTypingStatus);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  // Typing indicator with debounce
  const handleTyping = useCallback(
    (value: string) => {
      if (value.trim()) {
        setTypingStatus({
          conversationId,
          userId: currentUserClerkId,
          isTyping: true,
        }).catch(() => {});
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus({
          conversationId,
          userId: currentUserClerkId,
          isTyping: false,
        }).catch(() => {});
      }, 2000);
    },
    [conversationId, currentUserClerkId, setTypingStatus]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustHeight();
    handleTyping(e.target.value);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onCancelReply();

    // Stop typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTypingStatus({
      conversationId,
      userId: currentUserClerkId,
      isTyping: false,
    }).catch(() => {});

    try {
      await sendMessage({
        conversationId,
        body: trimmed,
        senderId: currentUserClerkId,
        replyToMessageId: replyTo?._id,
      });
    } catch {
      toast.error("Failed to send message");
      setText(trimmed); // restore on failure
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
    setTimeout(adjustHeight, 0);
  };

  const canSend = text.trim().length > 0 && !isSending;

  return (
    <div className="flex flex-col shrink-0 border-t border-border bg-background">
      {/* Reply preview bar */}
      {replyTo && (
        <ReplyPreview
          senderName={replyTo.senderName}
          body={replyTo.body}
          onCancel={onCancelReply}
        />
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Emoji picker */}
        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open emoji picker"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={cn(
              "w-9 h-9 rounded-full",
              showEmojiPicker && "bg-indigo-500/10 text-indigo-400"
            )}
          >
            <SmilePlus className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* Emoji grid */}
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 z-30 animate-fade-in">
              <div className="bg-background border border-border rounded-2xl shadow-xl p-3 w-64">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-7 h-7 flex items-center justify-center text-base rounded-lg hover:bg-muted hover:scale-110 transition-all duration-150 focus:outline-none"
                      aria-label={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text area */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          className={cn(
            "flex-1 resize-none overflow-hidden",
            "min-h-9 max-h-30",
            "text-sm leading-relaxed",
            "bg-muted/50 border-0",
            "focus-visible:ring-1 focus-visible:ring-indigo-500",
            "rounded-2xl px-4 py-2",
            "placeholder:text-muted-foreground/60",
            "transition-all"
          )}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "w-9 h-9 rounded-full shrink-0",
            "bg-indigo-500 hover:bg-indigo-600",
            "text-white shadow-md",
            "transition-all duration-150",
            !canSend && "opacity-40 cursor-not-allowed"
          )}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Close emoji picker on outside click */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
