import { redirect } from "next/navigation";
import { getDemoUser, hasRole } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState } from "../components/ui/EmptyState";
import { UserCircle, Plus, Search, Phone, Mail, Shield } from "lucide-react";
import { cn } from "@kobipro/ui";

const staff = [
  { id: "P-01", name: "Ali Korkmaz", role: "Teknisyen", email: "ali@cleanfix.com", phone: "+90 532 111 22 33", status: "Aktif", jobs: 45 },
  { id: "P-02", name: "Merve Toprak", role: "Sorumlu", email: "merve@cleanfix.com", phone: "+90 533 222 33 44", status: "Aktif", jobs: 67 },
  { id: "P-03", name: "Burak Şahin", role: "Teknisyen", email: "burak@cleanfix.com", phone: "+90 535 333 44 55", status: "İzinli", jobs: 38 },
  { id: "P-04", name: "Deniz Yıldız", role: "Teknisyen", email: "deniz@cleanfix.com", phone: "+90 536 444 55 66", status: "Aktif", jobs: 52 },
  { id: "P-05", name: "Can Özdemir", role: "Yönetici", email: "can@cleanfix.com", phone: "+90 537 555 66 77", status: "Aktif", jobs: 0 },
];

const statusStyles: Record<string, string> = {
  "Aktif": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "İzinli": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Pasif": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default async function StaffPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");

  const authorized = await hasRole(["ADMIN", "MANAGER"]);
  if (!authorized) {
    return (
      <DashboardLayout
        pageTitle="Personel"
        breadcrumbs={[{ label: "Personel" }]}
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

  const userName = user.name;
  const role = user.role;

  return (
    <DashboardLayout
      pageTitle="Personel"
      breadcrumbs={[{ label: "Personel" }]}
      user={{ name: userName, email: user.email, role }}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Personel ara..."
            className={cn(
              "pl-9 pr-3 py-2 rounded-lg text-sm w-64",
              "bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600",
              "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            )}
          />
        </div>
        <a
          href="/staff/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Yeni Personel
        </a>
      </div>

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="Henüz personel yok"
          description="İlk personel eklemek için + butonuna tıklayın"
          actionLabel="Yeni Personel Ekle"
          onAction={() => { /* navigate handled by link above */ }}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Personel</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">İletişim</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium text-right">Tamamlanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Shield size={13} className="text-slate-500" />
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} />
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", statusStyles[member.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-200 font-medium">{member.jobs} iş</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
