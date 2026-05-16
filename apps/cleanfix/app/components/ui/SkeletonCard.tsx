"use client";

import { cn } from "@kobipro/ui";

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export function SkeletonCard({ count = 4, className }: SkeletonCardProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-slate-900 p-5 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-3.5 w-24 rounded bg-slate-700" />
              <div className="h-8 w-20 rounded bg-slate-700" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-800" />
          </div>
          <div className="mt-4 h-3 w-16 rounded bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
