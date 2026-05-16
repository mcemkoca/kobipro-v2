"use client";

import { useState } from "react";
import { cn } from "@kobipro/ui";

export default function CompanyForm() {
  const [form, setForm] = useState({
    name: "CleanFix Ltd. Şti.",
    address: "İstiklal Cad. No:42, Beyoğlu/İstanbul",
    phone: "+90 212 555 01 23",
    email: "info@cleanfix.com.tr",
    taxId: "1234567890",
  });
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {([
        { key: "name", label: "Şirket Adı", type: "text" },
        { key: "address", label: "Adres", type: "text" },
        { key: "phone", label: "Telefon", type: "tel" },
        { key: "email", label: "E-posta", type: "email" },
        { key: "taxId", label: "Vergi Numarası", type: "text" },
      ] as const).map((field) => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {field.label}
          </label>
          <input
            type={field.type}
            value={form[field.key as keyof typeof form]}
            onChange={(e) => update(field.key, e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Kaydet
        </button>
        {saved && (
          <span className="text-xs text-emerald-400 font-medium">Kaydedildi ✓</span>
        )}
      </div>
    </div>
  );
}
