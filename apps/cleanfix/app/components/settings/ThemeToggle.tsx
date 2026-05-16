"use client";

import { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@kobipro/ui";

const themes = [
  { id: "light", label: "Açık", icon: Sun },
  { id: "dark", label: "Koyu", icon: Moon },
  { id: "system", label: "Sistem", icon: Monitor },
] as const;

export default function ThemeToggle() {
  const [selected, setSelected] = useState<"light" | "dark" | "system">("dark");

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((theme) => {
        const Icon = theme.icon;
        return (
          <button
            key={theme.id}
            onClick={() => setSelected(theme.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
              selected === theme.id
                ? "border-blue-500/50 bg-blue-500/10"
                : "border-slate-800 bg-slate-900 hover:border-slate-700"
            )}
          >
            <Icon
              size={20}
              className={cn(
                selected === theme.id ? "text-blue-400" : "text-slate-500"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                selected === theme.id ? "text-blue-400" : "text-slate-400"
              )}
            >
              {theme.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
