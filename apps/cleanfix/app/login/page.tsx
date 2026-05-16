import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function loginAction(formData: FormData) {
  "use server";
  const role = (formData.get("role") as string) || "ADMIN";
  const name = (formData.get("name") as string) || "Demo User";
  const user = { name, email: "demo@cleanfix.com", role };
  const cookieStore = await cookies();
  cookieStore.set("demo_login", encodeURIComponent(JSON.stringify(user)), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          CleanFix
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">CleanFix Demo</h1>
            <p className="text-slate-400">No external auth required — pick a demo role</p>
          </div>

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Display name</label>
              <input
                name="name"
                type="text"
                defaultValue="Demo User"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Role</label>
              <select
                name="role"
                defaultValue="ADMIN"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="CUSTOMER">Customer</option>
                <option value="TECHNICIAN">Technician</option>
              </select>
            </div>

            <button
              type="submit"
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-center transition-colors text-sm"
            >
              Enter Dashboard
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Demo mode — no real credentials needed
          </div>
        </div>
      </div>
    </div>
  );
}
