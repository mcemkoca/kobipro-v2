"use client";

import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { cn } from "@kobipro/ui";
import {
  Users,
  Shield,
  Activity,
  Server,
  Plus,
  CheckCircle2,
  XCircle,
  ChevronDown,
  X,
  Mail,
  User,
  Briefcase,
} from "lucide-react";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const ROLES = ["ADMIN", "MANAGER", "CUSTOMER", "EMPLOYEE"] as const;

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    MANAGER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CUSTOMER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    EMPLOYEE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return map[role] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

const statusIcon = (status: string) => {
  if (status === "active") return <CheckCircle2 size={14} className="text-emerald-400" />;
  return <XCircle size={14} className="text-rose-400" />;
};

interface AdminClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function AdminClient({ userName, userEmail, userRole }: AdminClientProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roleOpen, setRoleOpen] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("CUSTOMER");

  const changeRole = (userId: number, newRoleVal: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRoleVal } : u)));
    setRoleOpen(null);
  };

  const toggleStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u))
    );
  };

  const addUser = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const id = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    setUsers((prev) => [...prev, { id, name: newName.trim(), email: newEmail.trim(), role: newRole, status: "active" }]);
    setNewName("");
    setNewEmail("");
    setNewRole("CUSTOMER");
    setModalOpen(false);
  };

  const removeUser = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{users.length} kullanıcı</span>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                Yeni Kullanıcı
              </button>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-center mb-3">
                <Users size={20} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 mb-1">Henüz kullanıcı kaydı yok</p>
              <p className="text-xs text-slate-600">Yeni kullanıcı eklemek için yukarıdaki butonu kullanın.</p>
            </div>
          ) : (
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleStatus(u.id)}
                            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            {u.status === "active" ? "Pasifleştir" : "Aktifleştir"}
                          </button>
                          <button
                            onClick={() => removeUser(u.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-400" />
              Rol Tanımları
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { role: "ADMIN", label: "Yönetici", desc: "Tam yetki — panel, kullanıcılar, ayarlar" },
              { role: "MANAGER", label: "Müdür", desc: "Operasyonel yönetim — ekip, görev, stok" },
              { role: "CUSTOMER", label: "Müşteri", desc: "Teklif, randevu, portal erişimi" },
              { role: "EMPLOYEE", label: "Personel", desc: "Görev takibi, ekipman, bakım" },
            ].map((r) => (
              <div key={r.role} className="flex items-start gap-3">
                <span className={cn("mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border", roleBadge(r.role))}>
                  {r.role}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-300">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">Yeni Kullanıcı Ekle</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Ad Soyad</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    type="text"
                    placeholder="Ad Soyad"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">E-posta</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    type="email"
                    placeholder="ornek@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Rol</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={addUser}
                disabled={!newName.trim() || !newEmail.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
