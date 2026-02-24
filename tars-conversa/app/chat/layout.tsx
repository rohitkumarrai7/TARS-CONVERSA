"use client";

import { useParams } from "next/navigation";
import AppSidebar from "@/components/layout/AppSidebar";
import ConnectionStatus from "@/components/shared/ConnectionStatus";
import { cn } from "@/lib/utils";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const hasConversation = !!params?.conversationId;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ConnectionStatus />

      {/* Sidebar */}
      {/* Desktop: always visible
          Mobile: hidden when conversation is open */}
      <div
        className={cn(
          "flex-shrink-0 h-full",
          "md:block md:w-80",
          hasConversation ? "hidden" : "block w-full md:w-80"
        )}
      >
        <AppSidebar />
      </div>

      {/* Main chat area */}
      {/* Desktop: always visible
          Mobile: only visible when conversation open */}
      <div
        className={cn(
          "flex-1 h-full overflow-hidden",
          "md:block",
          hasConversation ? "block" : "hidden md:block"
        )}
      >
        {children}
      </div>
    </div>
  );
}
