"use client";

import { useConvex } from "convex/react";
import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConnectionStatus() {
  const convex = useConvex();
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = (convex as any).connectionState?.();
      if (
        state === "Disconnected" ||
        state === "Lost server connection"
      ) {
        setIsConnected(false);
        setShowBanner(true);
      } else {
        setIsConnected(true);
        if (!isConnected) {
          setTimeout(() => setShowBanner(false), 2000);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [convex, isConnected]);

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex items-center justify-center gap-2",
        "py-2 text-sm font-medium text-white",
        isConnected ? "bg-green-600" : "bg-yellow-600"
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" /> Connected
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" /> Reconnecting...
        </>
      )}
    </div>
  );
}
