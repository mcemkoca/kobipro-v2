"use client";

import { cn } from "@kobipro/ui";

interface SkeletonTableProps {
  columns: number;
  rows?: number;
  className?: string;
}

export function SkeletonTable({ columns, rows = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-slate-800/50">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`h-${i}`}
            className={cn(
              "h-4 rounded bg-slate-700 animate-pulse",
              i === columns - 1 ? "ml-auto w-24" : "flex-1",
              i === 0 && "max-w-[200px]"
            )}
          />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-800">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-3 px-5 py-3.5">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={cn(
                  "h-4 rounded bg-slate-800 animate-pulse",
                  colIdx === columns - 1 ? "ml-auto w-24" : "flex-1",
                  colIdx === 0 && "max-w-[200px]"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
