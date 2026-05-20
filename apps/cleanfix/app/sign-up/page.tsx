import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { rateLimit } from "@/lib/rate-limit";

async function signUpAction(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || password !== confirmPassword) {
    redirect("/sign-up?error=invalid");
  }

  if (password.length < 8) {
    redirect("/sign-up?error=weak");
  }

  const limit = await rateLimit(`signup:${email}`);
  if (!limit.allowed) {
    redirect("/sign-up?error=rate-limit");
  }

  const user = { name, email, role: "CUSTOMER" };
  const cookieStore = await cookies();
  cookieStore.set("demo_login", encodeURIComponent(JSON.stringify(user)), {
    path: "/",
    maxAge: 60 * 60 * 2,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/dashboard");
}

interface SignUpPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const weakPassword = params?.error === "weak";
  const rateLimited = params?.error === "rate-limit";

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

          {hasError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <p className="text-sm text-rose-300">Lütfen tüm alanları doldurun ve şifrelerin eşleştiğinden emin olun.</p>
            </div>
          )}

          {weakPassword && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-300">Şifre en az 8 karakter olmalı.</p>
            </div>
          )}

          {rateLimited && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-sm text-amber-300">Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.</p>
            </div>
          )}

          <form action={signUpAction} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  required
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-center transition-colors text-sm"
            >
              Kayıt Ol
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
