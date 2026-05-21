"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  User,
  Play,
  X,
  Trash2,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  Loader2,
  Save,
  AlertCircle,
  Bell,
  MapPin,
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";
import { cn } from "@kobipro/ui";
import { updateTaskStatus } from "@/app/actions/employee";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface EmployeeTask {
  id: string;
  service: string;
  customer: string;
  address: string;
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

interface DaySchedule {
  dayName: string;
  shortName: string;
  date: string;
  tasks: number;
  totalHours: number;
  isToday: boolean;
}

interface PerformanceStats {
  thisMonthCompleted: number;
  lastMonthCompleted: number;
  totalCompleted: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  efficiencyPercent: number;
  weeklyHours: number;
  monthlyRevenue: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "assignment" | "cancel" | "complete" | "system";
}

interface Props {
  user: { name: string; email: string; role: string };
  tasks: EmployeeTask[];
  weeklySchedule: DaySchedule[];
  stats: PerformanceStats;
  scheduleSlots: { hour: number; tasks: EmployeeTask[] }[];
  todayTasks: EmployeeTask[];
  notifications: NotificationItem[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const GRADIENTS = [
  { from: "from-rose-500", to: "to-orange-400" },
  { from: "from-amber-500", to: "to-yellow-400" },
  { from: "from-emerald-500", to: "to-teal-400" },
  { from: "from-cyan-500", to: "to-blue-400" },
  { from: "from-blue-500", to: "to-indigo-400" },
  { from: "from-violet-500", to: "to-purple-400" },
  { from: "from-fuchsia-500", to: "to-pink-400" },
  { from: "from-lime-500", to: "to-green-400" },
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function getGradient(str: string) {
  return GRADIENTS[hashString(str) % GRADIENTS.length];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDayNameTR(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return days[d.getDay()];
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PENDING: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "Beklemede" },
    CONFIRMED: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "Onaylandı" },
    IN_PROGRESS: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", label: "Devam Ediyor" },
    COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Tamamlandı" },
    CANCELLED: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", label: "İptal" },
  };
  const s = map[status] || { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", label: status };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", s.bg, s.text, s.border)}>
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Client Component                                                   */
/* ------------------------------------------------------------------ */
export default function EmployeeClient({
  user,
  tasks: initialTasks,
  weeklySchedule,
  stats: initialStats,
  scheduleSlots: initialSlots,
  todayTasks,
  notifications,
}: Props) {
  const [tasks, setTasks] = useState<EmployeeTask[]>(initialTasks);
  const [stats, setStats] = useState<PerformanceStats>(initialStats);
  const [scheduleSlots, setScheduleSlots] = useState(initialSlots);

  /* notes */
  const [notes, setNotes] = useState<{ id: string; text: string; createdAt: string }[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  /* notifications */
  const [notifOpen, setNotifOpen] = useState(false);

  /* action feedback */
  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* load notes from localStorage */
  useEffect(() => {
    const key = `cleanfix_employee_notes_${user.email}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setNotes(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [user.email]);

  /* save notes */
  const saveNotes = useCallback((list: typeof notes) => {
    localStorage.setItem(`cleanfix_employee_notes_${user.email}`, JSON.stringify(list));
  }, [user.email]);

  /* clear action msg */
  useEffect(() => {
    if (!actionMsg) return;
    const t = setTimeout(() => setActionMsg(null), 3000);
    return () => clearTimeout(t);
  }, [actionMsg]);

  /* recalc stats when tasks change */
  const recalcStats = useCallback((list: EmployeeTask[]) => {
    const completed = list.filter((t) => t.status === "COMPLETED").length;
    const pending = list.filter((t) => t.status === "PENDING").length;
    const inProgress = list.filter((t) => t.status === "IN_PROGRESS").length;
    const cancelled = list.filter((t) => t.status === "CANCELLED").length;
    const total = list.length;
    setStats((prev) => ({
      ...prev,
      totalCompleted: completed,
      pending,
      inProgress,
      cancelled,
      efficiencyPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    }));
    // recalc today's slots
    const todayStr = new Date().toISOString().split("T")[0];
    const todayTs = list.filter((t) => t.date === todayStr);
    const timeSlots = Array.from({ length: 9 }, (_, i) => 9 + i);
    setScheduleSlots(
      timeSlots.map((hour) => ({
        hour,
        tasks: todayTs.filter((t) => parseInt(t.time.split(":")[0]) === hour),
      }))
    );
  }, []);

  /* handlers */
  async function handleStartTask(id: string) {
    const res = await updateTaskStatus(id, "IN_PROGRESS");
    if (res.success) {
      setActionMsg({ type: "ok", text: "Görev başlatıldı." });
      const updated = tasks.map((t) => (t.id === id ? { ...t, status: "IN_PROGRESS" as const } : t));
      setTasks(updated);
      recalcStats(updated);
    } else {
      setActionMsg({ type: "err", text: res.error || "Başlatılamadı." });
    }
  }

  async function handleCompleteTask(id: string) {
    const res = await updateTaskStatus(id, "COMPLETED");
    if (res.success) {
      setActionMsg({ type: "ok", text: "Görev tamamlandı." });
      const updated = tasks.map((t) => (t.id === id ? { ...t, status: "COMPLETED" as const } : t));
      setTasks(updated);
      recalcStats(updated);
    } else {
      setActionMsg({ type: "err", text: res.error || "Tamamlanamadı." });
    }
  }

  function handleAddNote() {
    if (!noteInput.trim()) return;
    const newNote = { id: `note-${Date.now()}`, text: noteInput.trim(), createdAt: new Date().toISOString() };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setNoteInput("");
    setNoteSaving(true);
    setTimeout(() => setNoteSaving(false), 500);
  }

  function handleDeleteNote(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  }

  function handleLogout() {
    document.cookie = "demo_login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }

  /* derived */
  const userGradient = getGradient(user.name + user.email);
  const perfDiff = stats.thisMonthCompleted - stats.lastMonthCompleted;
  const perfPercent = stats.lastMonthCompleted > 0 ? Math.round((perfDiff / stats.lastMonthCompleted) * 100) : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayName = getDayNameTR(todayStr);

  return (
    <DashboardLayout pageTitle="Çalışan Profili" user={user}>
      {/* Action Toast */}
      {actionMsg && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border text-sm font-medium shadow-lg flex items-center gap-2 transition-all",
          actionMsg.type === "ok" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          {actionMsg.type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {actionMsg.text}
        </div>
      )}

      {/* Top Row: Profile + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg", userGradient.from, userGradient.to)}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-100 truncate">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mt-1",
                user.role === "ADMIN" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                user.role === "MANAGER" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>
                {user.role === "ADMIN" ? "Admin" : user.role === "MANAGER" ? "Yönetici" : "Çalışan"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                  <Bell size={18} />
                  {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950" />}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bildirimler</span>
                        <span className="text-xs text-slate-500">{notifications.length}</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                            <div className="flex items-start gap-2.5">
                              <div className={cn("mt-0.5 w-2 h-2 rounded-full shrink-0",
                                n.type === "assignment" ? "bg-blue-400" : n.type === "cancel" ? "bg-rose-400" : "bg-slate-400"
                              )} />
                              <div>
                                <p className="text-sm font-medium text-slate-200">{n.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                                <p className="text-[11px] text-slate-500 mt-1">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700">
                Çıkış Yap
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
            <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3">
              <p className="text-xs text-slate-500 mb-0.5">Bu Ay</p>
              <p className="text-sm text-slate-200 font-medium">{stats.thisMonthCompleted} tamamlanan</p>
            </div>
            <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3">
              <p className="text-xs text-slate-500 mb-0.5">Verimlilik</p>
              <p className="text-sm text-slate-200 font-medium">%{stats.efficiencyPercent}</p>
            </div>
            <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3">
              <p className="text-xs text-slate-500 mb-0.5">Haftalık Saat</p>
              <p className="text-sm text-slate-200 font-medium">{stats.weeklyHours.toFixed(1)} saat</p>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Bu Ay Tamamlanan</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{stats.thisMonthCompleted}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {perfDiff > 0 ? (
              <>
                <TrendingUp size={16} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">%{perfPercent}</span>
              </>
            ) : perfDiff < 0 ? (
              <>
                <TrendingDown size={16} className="text-rose-400" />
                <span className="text-xs text-rose-400 font-medium">%{Math.abs(perfPercent)}</span>
              </>
            ) : (
              <span className="text-xs text-slate-500">Değişim yok</span>
            )}
            <span className="text-xs text-slate-500">· Geçen ay: {stats.lastMonthCompleted}</span>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Bugünkü Görevlerim</h3>
            </div>
            <span className="text-xs text-slate-500">{todayName} · {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</span>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{task.service}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={12} />{task.time}</p>
                    </div>
                    {statusBadge(task.status)}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <User size={12} />{task.customer}
                      <span className="flex items-center gap-1 ml-2"><MapPin size={12} />{task.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status === "PENDING" && (
                        <button onClick={() => handleStartTask(task.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors">
                          <Play size={12} /> Başlat
                        </button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <button onClick={() => handleCompleteTask(task.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
                          <CheckCircle2 size={12} /> Tamamla
                        </button>
                      )}
                      {task.status === "COMPLETED" && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Tamamlandı</span>
                      )}
                      {task.status === "CONFIRMED" && (
                        <button onClick={() => handleStartTask(task.id)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors">
                          <Play size={12} /> Başlat
                        </button>
                      )}
                    </div>
                  </div>
                  {task.notes && <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">{task.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Schedule Visual */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Mesai Çizelgesi</h3>
            </div>
            <span className="text-xs text-slate-500">09:00 — 17:00</span>
          </div>
          <div className="p-5">
            <div className="space-y-1">
              {scheduleSlots.map((slot) => {
                const hasTask = slot.tasks.length > 0;
                return (
                  <div key={slot.hour} className="flex items-center gap-3">
                    <span className="w-10 text-xs text-slate-500 text-right shrink-0">{String(slot.hour).padStart(2, "0")}:00</span>
                    <div className="flex-1 h-8 rounded-md border border-slate-800 bg-slate-800/30 flex items-center px-2 gap-1 overflow-hidden">
                      {hasTask ? (
                        slot.tasks.map((b) => (
                          <div key={b.id} className={cn("px-2 py-0.5 rounded text-[11px] font-medium truncate border",
                            b.status === "IN_PROGRESS" ? "bg-purple-500/15 text-purple-300 border-purple-500/20" :
                            b.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" :
                            "bg-blue-500/15 text-blue-300 border-blue-500/20"
                          )} title={`${b.service} — ${b.customer}`}>
                            {b.service} · {b.customer}
                          </div>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-600">Boş</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg bg-slate-800/50 border border-slate-800 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Bugün toplam</span>
                <span className="text-slate-200 font-medium">{todayTasks.length} görev</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (todayTasks.length / 6) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-200">Haftalık Program</h3>
            </div>
            <span className="text-xs text-slate-500">{formatDate(weeklySchedule[0].date)} — {formatDate(weeklySchedule[4].date)}</span>
          </div>
          <div className="p-5 space-y-2">
            {weeklySchedule.map((day) => (
              <div key={day.dayName} className={cn("flex items-center justify-between p-3 rounded-lg border transition-colors",
                day.isToday ? "bg-blue-500/5 border-blue-500/20" : "bg-slate-800/50 border-slate-800"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium",
                    day.isToday ? "bg-blue-500/15 text-blue-300" : "bg-slate-800 text-slate-400"
                  )}>
                    {day.shortName.charAt(0)}
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", day.isToday ? "text-blue-300" : "text-slate-200")}>{day.dayName}</p>
                    <p className="text-xs text-slate-500">{day.tasks > 0 ? `${day.totalHours.toFixed(1)} saat` : "Boş"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">{day.tasks}</p>
                  <p className="text-xs text-slate-500">görev</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Aylık Kazanç</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Mayıs 2026</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">€{stats.monthlyRevenue.toLocaleString("de-DE")}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <Wallet size={20} className="text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">%12</span>
              <span className="text-xs text-slate-500">· Nisan: €2.540</span>
            </div>
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Saatlik Ücret</span>
                <span className="text-slate-200 font-medium">€25</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Çalışılan Saat</span>
                <span className="text-slate-200 font-medium">{stats.weeklyHours.toFixed(1)} saat</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ekstra Mesai</span>
                <span className="text-slate-200 font-medium">€180</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-200">Genel Performans</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Toplam Tamamlanan</span><span className="text-lg font-bold text-slate-100">{stats.totalCompleted}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Bekleyen</span><span className="text-sm font-medium text-amber-400">{stats.pending}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Devam Eden</span><span className="text-sm font-medium text-purple-400">{stats.inProgress}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">İptal</span><span className="text-sm font-medium text-rose-400">{stats.cancelled}</span></div>
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Verimlilik</span>
                <span className="text-slate-200 font-medium">%{stats.efficiencyPercent}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-400 h-2 rounded-full transition-all" style={{ width: `${stats.efficiencyPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Notes / Messages */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden md:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Notlar / Mesajlar</h3>
            </div>
            {noteSaving && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Kaydedildi</span>}
          </div>
          <div className="p-5 space-y-4">
            {notes.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 group">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.text}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteNote(note.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0" title="Sil">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-3">
              <textarea rows={3} value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Yeni not ekleyin..."
                className="flex-1 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none placeholder:text-slate-500" />
              <button onClick={handleAddNote} disabled={!noteInput.trim()} className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
