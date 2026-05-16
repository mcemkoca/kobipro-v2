import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          CleanFix
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4">
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
      </div>
    </div>
  );
}
