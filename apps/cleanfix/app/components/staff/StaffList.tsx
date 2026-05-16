"use client";

import { useState, useMemo } from "react";
import { StaffForm, StaffFormData } from "./StaffForm";
import { StaffModal } from "./StaffModal";
import { createStaff, updateStaff, deleteStaff, toggleStaffStatus } from "@/app/actions/staff";
import { Button } from "@kobipro/ui";
import { cn } from "@kobipro/ui";
import { Search, UserCircle, Phone, Mail, Shield } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  displayRole?: string;
  status: string;
  displayStatus?: string;
  jobs: number;
  active?: boolean;
  createdAt: Date;
}

interface StaffListProps {
  staff: Staff[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Aktif: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LEAVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  İzinli: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  INACTIVE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Pasif: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const roleLabels: Record<string, string> = {
  EMPLOYEE: "Teknisyen",
  MANAGER: "Sorumlu",
  ADMIN: "Yönetici",
  Teknisyen: "Teknisyen",
  Sorumlu: "Sorumlu",
  Yönetici: "Yönetici",
};

export function StaffList({ staff, onRefresh }: StaffListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery);
      const role = member.displayRole || roleLabels[member.role] || member.role;
      const matchesRole = roleFilter === "ALL" || role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, searchQuery, roleFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    setLoading(id);
    const result = await deleteStaff(id);
    setLoading(null);
    if (result.success) {
      onRefresh();
    } else {
      alert(result.error);
    }
  }

  async function handleToggleStatus(id: string) {
    setLoading(id);
    const result = await toggleStaffStatus(id);
    setLoading(null);
    if (result.success) {
      onRefresh();
    } else {
      alert(result.error);
    }
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  function getRoleBadgeColor(role: string) {
    const r = role.toLowerCase();
    if (r.includes("yönetici") || r.includes("admin")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (r.includes("sorumlu") || r.includes("manager")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm",
              "bg-slate-900 border border-slate-800 text-slate-200",
              "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            )}
          >
            <option value="ALL">Tüm Roller</option>
            <option value="Teknisyen">Teknisyen</option>
            <option value="Sorumlu">Sorumlu</option>
            <option value="Yönetici">Yönetici</option>
          </select>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Yeni Personel</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Personel</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Rol</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">İletişim</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Durum</th>
              <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">Tamamlanan</th>
              <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredStaff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle size={32} className="text-slate-600" />
                    <p>Henüz personel eklenmemiş.</p>
                    <p className="text-xs text-slate-600">Yeni bir personel eklemek için yukarıdaki butonu kullanın.</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredStaff.map((member) => {
              const displayRole = member.displayRole || roleLabels[member.role] || member.role;
              const displayStatus = member.displayStatus || (member.status === "ACTIVE" ? "Aktif" : member.status === "LEAVE" ? "İzinli" : member.status === "INACTIVE" ? "Pasif" : member.status);
              return (
                <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border", getRoleBadgeColor(displayRole))}>
                      <Shield size={12} />
                      {displayRole}
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
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", statusColors[displayStatus] || statusColors[member.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
                      {displayStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-200 font-medium">{member.jobs || 0} iş</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        disabled={loading === member.id}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Durum Değiştir
                      </button>
                      <button
                        onClick={() => setEditingStaff(member)}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={loading === member.id}
                        className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <StaffModal title="Yeni Personel" onClose={() => setIsCreateModalOpen(false)}>
          <StaffForm
            onSubmit={async (data) => {
              const result = await createStaff(data);
              if (result.success) {
                setIsCreateModalOpen(false);
                onRefresh();
              } else {
                alert(result.error);
              }
            }}
          />
        </StaffModal>
      )}

      {editingStaff && (
        <StaffModal title="Personeli Düzenle" onClose={() => setEditingStaff(null)}>
          <StaffForm
            initialData={{
              name: editingStaff.name,
              email: editingStaff.email,
              phone: editingStaff.phone,
              role: editingStaff.displayRole || roleLabels[editingStaff.role] || editingStaff.role,
              status: editingStaff.displayStatus || (editingStaff.status === "ACTIVE" ? "Aktif" : editingStaff.status === "LEAVE" ? "İzinli" : editingStaff.status === "INACTIVE" ? "Pasif" : editingStaff.status),
              jobs: editingStaff.jobs || 0,
            }}
            onSubmit={async (data) => {
              const result = await updateStaff(editingStaff.id, data);
              if (result.success) {
                setEditingStaff(null);
                onRefresh();
              } else {
                alert(result.error);
              }
            }}
          />
        </StaffModal>
      )}
    </div>
  );
}
