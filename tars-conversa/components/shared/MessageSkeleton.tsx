import { Skeleton } from "@/components/ui/skeleton";

const leftWidths = ["w-48", "w-64", "w-56", "w-48"];
const rightWidths = ["w-52", "w-40", "w-60"];

export default function MessageSkeleton() {
  return (
    <div className="py-4">
      {Array.from({ length: 7 }).map((_, i) => {
        const isLeft = i % 2 === 0;

        if (isLeft) {
          return (
            <div key={i} className="flex justify-end mb-4 px-4">
              <Skeleton
                className={`h-12 rounded-2xl rounded-tr-sm ${leftWidths[i % leftWidths.length]}`}
              />
            </div>
          );
        }

        return (
          <div key={i} className="flex items-end gap-2 mb-4 px-4">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton
              className={`h-12 rounded-2xl rounded-tl-sm ${rightWidths[i % rightWidths.length]}`}
            />
          </div>
        );
      })}
    </div>
  );
}
