"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "h-full gap-4 text-center px-8 py-12",
        className
      )}
    >
      <div className="p-4 rounded-full bg-muted">
        <Icon className="w-10 h-10 text-muted-foreground opacity-50" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-indigo-500 hover:bg-indigo-600 text-white mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
