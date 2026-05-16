import { redirect } from "next/navigation";
import { getDemoUser, isAdmin } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { Shield } from "lucide-react";

export default async function AdminPage() {
  const user = await getDemoUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin();

  if (!admin) {
    return (
      <DashboardLayout
        pageTitle="Admin Panel"
        breadcrumbs={[{ label: "Admin" }]}
        user={{ name: user.name, email: user.email, role: user.role }}
      >
        <div className="flex flex-col items-center justify-center py-24">
          <Shield size={48} className="text-slate-700 mb-4" />
          <h2 className="text-lg font-semibold text-slate-300 mb-1">Erişim Reddedildi</h2>
          <p className="text-sm text-slate-500">Bu sayfayı görüntüleme yetkiniz yok.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Admin Panel"
      breadcrumbs={[{ label: "Admin" }]}
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-2">Users</h2>
          <p className="text-sm text-slate-500">Manage users, roles, and permissions.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-2">Organizations</h2>
          <p className="text-sm text-slate-500">View and configure organizations.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-2">Billing</h2>
          <p className="text-sm text-slate-500">Subscription and payment settings.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-2">System</h2>
          <p className="text-sm text-slate-500">Logs, health checks, and configuration.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
