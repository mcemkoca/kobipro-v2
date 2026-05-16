"use client";

import { useState } from "react";
import { cn } from "@kobipro/ui";

const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];
const data = [42, 38, 52, 48, 56, 50.5]; // thousands

export default function RevenueChart() {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-28">
        {data.map((val, i) => {
          const pct = (val / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-300 relative",
                  hovered === i ? "bg-blue-400" : "bg-blue-500/40 group-hover:bg-blue-500/60"
                )}
                style={{ height: `${pct}%` }}
              >
                {hovered === i && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded-md border border-slate-700 shadow-lg whitespace-nowrap z-10">
                    ₺{val}K
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        {months.map((m, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-slate-500 uppercase">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
