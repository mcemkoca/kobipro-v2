import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your organization and users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-950">
          <h2 className="text-base font-semibold mb-2">Users</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage users, roles, and permissions.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-950">
          <h2 className="text-base font-semibold mb-2">Organizations</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            View and configure organizations.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-950">
          <h2 className="text-base font-semibold mb-2">Billing</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Subscription and payment settings.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-950">
          <h2 className="text-base font-semibold mb-2">System</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Logs, health checks, and configuration.
          </p>
        </div>
      </div>
    </main>
  );
}
