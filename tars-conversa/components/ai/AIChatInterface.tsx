"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Send, Sparkles, RotateCcw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Help me write a friendly opening message",
  "Summarize key points of a conversation",
  "How do I start a group chat?",
  "Write a professional apology message",
];

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setIsLoading(true);

      const history = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text.trim() },
      ];

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok) throw new Error("AI request failed");

        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content ?? "Sorry, no response.",
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        toast.error("Failed to get AI response. Check your API key.");
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">TARS AI</h2>
            <p className="text-xs text-muted-foreground">Powered by OpenRouter</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            aria-label="Clear conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chat-scroll"
      >
        {messages.length === 0 ? (
          /* Welcome / empty state */
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg">TARS AI</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your intelligent assistant. Ask me anything — I can help draft
                messages, answer questions, and more.
              </p>
            </div>
            {/* Suggestion chips */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs px-3 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted hover:border-indigo-500/30 transition-all text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 animate-fade-in",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* AI avatar */}
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 self-end mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    "relative group max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-500 text-white rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap wrap-break-word">
                    {msg.content}
                  </div>

                  {/* Copy button — assistant only */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      aria-label="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {isLoading && (
              <div className="flex gap-2.5 animate-fade-in">
                <div className="w-7 h-7 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 self-end mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3.5 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask TARS AI anything…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none overflow-hidden min-h-9 max-h-30 text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-2xl px-4 py-2 placeholder:text-muted-foreground/60"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className={cn(
              "w-9 h-9 rounded-full shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white shadow-md",
              (!input.trim() || isLoading) && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-2">
          TARS AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
