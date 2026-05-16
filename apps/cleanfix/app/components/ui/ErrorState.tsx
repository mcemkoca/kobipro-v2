"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@kobipro/ui";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-rose-500/20 bg-rose-500/5",
        className
      )}
    >
      <AlertTriangle size={48} className="text-rose-500/60 mb-4" />
      <h3 className="text-base font-semibold text-rose-400 mb-1">Bir hata oluştu</h3>
      <p className="text-sm text-rose-300/70 mb-5 text-center max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Tekrar Dene
        </button>
      )}
    </div>
  );
}
