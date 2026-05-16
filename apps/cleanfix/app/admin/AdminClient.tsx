"use client";

import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { cn } from "@kobipro/ui";
import {
  Users,
  Shield,
  Activity,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from "lucide-react";

const DEMO_USERS = [
  { id: 1, name: "Ahmet Yılmaz", email: "admin@cleanfix.com", role: "ADMIN", status: "active" },
  { id: 2, name: "Merve Toprak", email: "manager@cleanfix.com", role: "MANAGER", status: "active" },
  { id: 3, name: "Zeynep Arslan", email: "customer@email.com", role: "CUSTOMER", status: "active" },
  { id: 4, name: "Ali Korkmaz", email: "ali@cleanfix.com", role: "TECHNICIAN", status: "inactive" },
];

const ROLES = ["ADMIN", "MANAGER", "CUSTOMER", "TECHNICIAN"] as const;

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    MANAGER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CUSTOMER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    TECHNICIAN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return map[role] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

const statusIcon = (status: string) => {
  if (status === "active") return <CheckCircle2 size={14} className="text-emerald-400" />;
  return <XCircle size={14} className="text-rose-400" />;
};

function SystemHealth() {
  const services = [
    { name: "API Sunucusu", status: "healthy", latency: "42ms" },
    { name: "Veritabanı", status: "healthy", latency: "18ms" },
    { name: "Redis Cache", status: "healthy", latency: "3ms" },
    { name: "E-posta Servisi", status: "warning", latency: "320ms" },
  ];

  return (
    <div className="space-y-3">
      {services.map((svc) => (
        <div key={svc.name} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {svc.status === "healthy" ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : svc.status === "warning" ? (
              <AlertTriangle size={16} className="text-amber-400" />
            ) : (
              <XCircle size={16} className="text-rose-400" />
            )}
            <span className="text-sm text-slate-300">{svc.name}</span>
          </div>
          <span className={cn("text-xs font-medium", svc.status === "healthy" ? "text-emerald-400" : "text-amber-400")}>
            {svc.latency}
          </span>
        </div>
      ))}
    </div>
  );
}

interface AdminClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function AdminClient({ userName, userEmail, userRole }: AdminClientProps) {
  const [users, setUsers] = useState(DEMO_USERS);
  const [roleOpen, setRoleOpen] = useState<number | null>(null);

  const changeRole = (userId: number, newRole: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    setRoleOpen(null);
  };

  const toggleStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u))
    );
  };

  const stats = [
    { label: "Toplam Kullanıcı", value: users.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Admin", value: users.filter((u) => u.role === "ADMIN").length, icon: Shield, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Aktif", value: users.filter((u) => u.status === "active").length, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pasif", value: users.filter((u) => u.status === "inactive").length, icon: Server, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <DashboardLayout
      pageTitle="Admin Panel"
      breadcrumbs={[{ label: "Admin" }]}
      user={{ name: userName, email: userEmail, role: userRole }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                <Icon size={18} className={s.color} />
              </div>
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-lg font-semibold text-slate-100">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Kullanıcı Yönetimi
            </h2>
            <span className="text-xs text-slate-500">{users.length} kullanıcı</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Kullanıcı</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Rol</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Durum</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-semibold text-white">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 relative">
                      <button
                        onClick={() => setRoleOpen(roleOpen === u.id ? null : u.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                          roleBadge(u.role)
                        )}
                      >
                        {u.role}
                        <ChevronDown size={12} />
                      </button>
                      {roleOpen === u.id && (
                        <div className="absolute z-10 mt-1 w-32 rounded-lg border border-slate-800 bg-slate-950 shadow-xl py-1">
                          {ROLES.map((r) => (
                            <button
                              key={r}
                              onClick={() => changeRole(u.id, r)}
                              className={cn(
                                "w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors",
                                u.role === r ? "text-blue-400 font-medium" : "text-slate-300"
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}
                      >
                        {statusIcon(u.status)}
                        {u.status === "active" ? "Aktif" : "Pasif"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {u.status === "active" ? "Pasifleştir" : "Aktifleştir"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Database size={16} className="text-emerald-400" />
              Sistem Sağlığı
            </h2>
          </div>
          <div className="p-5">
            <SystemHealth />
          </div>
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Son kontrol</span>
              <span className="text-slate-300">{new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
