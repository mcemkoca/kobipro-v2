"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <FileQuestion size={36} className="text-slate-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-100 mb-3 tracking-tight">
          404 — Sayfa Bulunamadı
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            <Home size={16} />
            Dashboard&apos;a Dön
          </Link>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Geri
          </button>
        </div>
      </div>
    </div>
  );
}
