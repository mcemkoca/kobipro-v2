import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LogIn, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

async function loginAction(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  const ADMIN_EMAIL = "mcemkoca0@gmail.com";
  const ADMIN_PASSWORD = "admin123";

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user = { name: "Admin", email: ADMIN_EMAIL, role: "ADMIN" };
    const cookieStore = await cookies();
    cookieStore.set("demo_login", encodeURIComponent(JSON.stringify(user)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "lax",
    });
    redirect("/dashboard");
  }

  redirect("/login?error=invalid");
}

interface LoginPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";

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
            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <LogIn size={22} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">CleanFix</h1>
            <p className="text-sm text-slate-500">Hesabınıza giriş yapın</p>
          </div>

          {hasError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <p className="text-sm text-rose-300">E-posta veya şifre hatalı.</p>
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ornek@email.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm"
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
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-center transition-colors text-sm"
            >
              Giriş Yap
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Hesabın yok mu?{" "}
            <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Kayıt ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
