"use client";

import { useState } from "react";
import { cn } from "@kobipro/ui";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    weeklyReport: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div className="space-y-4">
      {([
        { key: "email" as const, label: "E-posta Bildirimleri", desc: "Yeni randevu, iptal ve hatırlatmalar" },
        { key: "push" as const, label: "Push Bildirimleri", desc: "Tarayıcı push bildirimleri al" },
        { key: "weeklyReport" as const, label: "Haftalık Rapor", desc: "Her pazartesi özet e-postası" },
      ] as const).map((item) => (
        <label
          key={item.key}
          className="flex items-center justify-between gap-4 cursor-pointer group"
        >
          <div>
            <p className="text-sm font-medium text-slate-200">{item.label}</p>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
          <div className="relative inline-flex h-6 w-11 shrink-0">
            <input
              type="checkbox"
              checked={settings[item.key]}
              onChange={() => toggle(item.key)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-block h-6 w-11 rounded-full transition-colors",
                "peer-checked:bg-blue-600 bg-slate-700"
              )}
            />
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                settings[item.key] ? "translate-x-5" : "translate-x-0"
              )}
            />
          </div>
        </label>
      ))}
    </div>
  );
}
