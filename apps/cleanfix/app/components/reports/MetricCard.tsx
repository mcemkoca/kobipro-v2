"use client";

import { ReactNode } from "react";
import { cn } from "@kobipro/ui";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
  onClick?: () => void;
  children?: ReactNode;
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  onClick,
  children,
}: MetricCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-emerald-400"
      : changeType === "negative"
      ? "text-rose-400"
      : "text-slate-400";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition-all",
        onClick && "hover:border-slate-700 cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
          <div className="text-blue-400">{icon}</div>
        </div>
        {change && (
          <span className={cn("text-xs font-medium", changeColor)}>
            {change}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <p className="text-lg font-semibold text-slate-100">{value}</p>
      {children && <div className="mt-4 pt-4 border-t border-slate-800">{children}</div>}
    </button>
  );
}
