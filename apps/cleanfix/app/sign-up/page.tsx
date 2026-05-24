'use client';

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasError = searchParams?.get("error") === "invalid";
  const weakPassword = searchParams?.get("error") === "weak";
  const rateLimited = searchParams?.get("error") === "rate-limit";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(hasError ? "Lütfen tüm alanları doldurun ve şifrelerin eşleştiğinden emin olun." : null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || password !== confirmPassword) {
      setFormError("Lütfen tüm alanları doldurun ve şifrelerin eşleştiğinden emin olun.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setFormError("Şifre en az 8 karakter olmalı.");
      setLoading(false);
      return;
    }

    const user = { name: trimmedName, email: trimmedEmail, role: "CUSTOMER" };
    const token = `cf_${Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("")}_${Date.now()}`;
    localStorage.setItem("demo_login", token);
    localStorage.setItem("user", JSON.stringify(user));
    router.push("/dashboard");
  }, [name, email, password, confirmPassword, router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800/50">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          CleanFix
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <UserPlus size={22} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">CleanFix</h1>
            <p className="text-sm text-slate-500">Yeni hesap oluşturun</p>
          </div>

          {formError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <p className="text-sm text-rose-300">{formError}</p>
            </div>
          )}

          {weakPassword && !formError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-300">Şifre en az 8 karakter olmalı.</p>
            </div>
          )}

          {rateLimited && !formError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-300">Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Şifre Tekrar</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-center transition-colors text-sm disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Zaten hesabın var?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
