"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  imageUrl: string;
  name: string;
  size?: "sm" | "md" | "lg";
  showOnlineDot?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeClassMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export default function UserAvatar({
  imageUrl,
  name,
  size = "md",
  showOnlineDot = false,
  isOnline = false,
  className,
}: UserAvatarProps) {
  const fallback = name ? name.charAt(0).toUpperCase() : "?";
  const sizeClass = sizeClassMap[size];

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClass, className)}>
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="bg-indigo-500 text-white font-semibold text-sm">
          {fallback}
        </AvatarFallback>
      </Avatar>

      {showOnlineDot && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full",
            "border-2 border-background",
            "w-2.5 h-2.5",
            isOnline ? "bg-green-500" : "bg-zinc-400"
          )}
        />
      )}
    </div>
  );
}
