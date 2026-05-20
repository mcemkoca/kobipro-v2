"use client";

import { useState, useEffect } from "react";
import { getDemoUser, hasRole } from "@/lib/auth";
import { getStaff } from "../actions/staff";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonTable } from "../components/ui/SkeletonTable";
import { ErrorState } from "../components/ui/ErrorState";
import { UserCircle, Plus, Search, Phone, Mail, Shield } from "lucide-react";
import { cn } from "@kobipro/ui";

interface DemoUser {
  name: string;
  email: string;
  role: string;
}

const roleDisplayMap: Record<string, string> = {
  EMPLOYEE: "Teknisyen",
  MANAGER: "Sorumlu",
  ADMIN: "Yönetici",
};

const statusStyles: Record<string, string> = {
  "Aktif": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "İzinli": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Pasif": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function StaffPage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const u = await getDemoUser();
        if (!u) {
          window.location.href = "/login";
          return;
        }
        setUser(u);

        const auth = await hasRole(["ADMIN", "MANAGER"]);
        setAuthorized(auth);

        if (auth) {
          const res = await getStaff();
          if (res.success) {
            setStaff(res.data || []);
            setFilteredStaff(res.data || []);
          } else {
            setError(res.error || "Personel yüklenirken hata oluştu");
          }
        }
      } catch (err) {
        setError("Sayfa yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStaff(staff);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredStaff(
      staff.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          roleDisplayMap[s.role]?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, staff]);

  if (!user && loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) return null;

  if (authorized === false) {
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

  return (
    <DashboardLayout
      pageTitle="Personel"
      breadcrumbs={[{ label: "Personel" }]}
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Personel ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {error && !loading && (
        <div className="mb-6">
          <ErrorState
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {loading ? (
        <SkeletonTable columns={5} rows={5} />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title={searchQuery ? "Sonuç bulunamadı" : "Henüz personel yok"}
          description={
            searchQuery
              ? "Aramanızla eşleşen personel bulunamadı"
              : "İlk personel eklemek için + butonuna tıklayın"
          }
          actionLabel={!searchQuery ? "Yeni Personel Ekle" : undefined}
          onAction={!searchQuery ? () => { window.location.href = "/staff/new"; } : undefined}
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
                {filteredStaff.map((member) => {
                  const displayRole = roleDisplayMap[member.role] || member.role || "—";
                  const displayStatus = member.active === false ? "Pasif" : "Aktif";
                  return (
                    <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {member.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{member.name}</p>
                            <p className="text-xs text-slate-500">{member.id?.slice(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Shield size={13} className="text-slate-500" />
                          {displayRole}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} />
                            {member.email || "—"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} />
                            {member.phone || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", statusStyles[displayStatus] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-200 font-medium">—</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
