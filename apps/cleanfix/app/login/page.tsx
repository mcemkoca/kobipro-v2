import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const DEMO_MODE =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_placeholder") ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_placeholder") ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function DemoLogin() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">CleanFix Demo</h1>
        <p className="text-slate-400">Demo mode — no real auth required</p>
      </div>
      <Link
        href="/dashboard"
        className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-center transition-colors"
      >
        Enter Dashboard (Demo)
      </Link>
      <div className="text-center text-sm text-slate-500">
        Clerk auth disabled — demo data only
      </div>
    </div>
  );
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
        {DEMO_MODE ? (
          <DemoLogin />
        ) : (
          <div className="w-full max-w-sm">
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: "#18181b",
                },
              }}
              routing="hash"
              fallbackRedirectUrl="/dashboard"
            />
          </div>
        )}
      </div>
    </div>
  );
}
