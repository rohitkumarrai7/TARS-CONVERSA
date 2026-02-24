"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewMessagesButtonProps {
  onClick: () => void;
}

export default function NewMessagesButton({ onClick }: NewMessagesButtonProps) {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
      <Button
        onClick={onClick}
        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 px-4 h-8 text-xs font-medium gap-1.5"
      >
        <ArrowDown className="w-3.5 h-3.5" />
        New messages
      </Button>
    </div>
  );
}
