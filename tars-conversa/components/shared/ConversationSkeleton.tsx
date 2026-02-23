import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center px-3 py-3 gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex flex-col flex-1 gap-2">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-44 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
