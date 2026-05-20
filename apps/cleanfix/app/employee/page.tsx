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
} from "lucide-react";
import { cn } from "@kobipro/ui";
import { getBookings, updateBookingStatus } from "@/app/actions/bookings";
import { getStaff } from "@/app/actions/staff";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface DemoUser {
  name: string;
  email: string;
  role: string;
}

interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string | null;
  date: Date | string;
  time: string;
  status: string;
  notes: string | null;
  customer?: { id: string; name: string; address?: string | null };
  service?: { id: string; name: string };
  staff?: { id: string; name: string } | null;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  active?: boolean;
  createdAt?: Date | string;
}

interface EmployeeNote {
  id: string;
  text: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "assignment" | "cancel" | "complete" | "system";
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
  const idx = hashString(str) % GRADIENTS.length;
  return GRADIENTS[idx];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(d: Date | string | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isSameDay(a: Date | string, b: Date | string) {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDayNameTR(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return days[d.getDay()];
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      label: "Beklemede",
    },
    CONFIRMED: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      label: "Onaylandı",
    },
    IN_PROGRESS: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      label: "Devam Ediyor",
    },
    COMPLETED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      label: "Tamamlandı",
    },
    CANCELLED: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      label: "İptal",
    },
  };
  const s = map[status] || {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    label: status,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        s.bg,
        s.text,
        s.border
      )}
    >
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function EmployeePage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  /* data */
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [matchedStaff, setMatchedStaff] = useState<StaffMember | null>(null);

  /* notes */
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  /* notifications */
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  /* action feedback */
  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* read user from cookie */
  useEffect(() => {
    const match = document.cookie.match(/demo_login=([^;]+)/);
    if (match) {
      try {
        const parsed = JSON.parse(decodeURIComponent(match[1])) as DemoUser;
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  /* load data */
  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    const [bkRes, stRes] = await Promise.all([getBookings(), getStaff()]);

    if (bkRes.success) setAllBookings(bkRes.data || []);
    if (stRes.success) {
      const s = (stRes.data || []) as StaffMember[];
      setAllStaff(s);
      /* match staff by email, then by name */
      const byEmail = s.find(
        (x) => x.email && x.email.toLowerCase() === user.email.toLowerCase()
      );
      const byName = s.find((x) => x.name.toLowerCase() === user.name.toLowerCase());
      const matched = byEmail || byName || null;
      setMatchedStaff(matched);
    }
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  /* load notes from localStorage */
  useEffect(() => {
    if (!user) return;
    const key = `cleanfix_employee_notes_${matchedStaff?.id || user.name}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setNotes(JSON.parse(raw));
    } catch {
      setNotes([]);
    }
  }, [user, matchedStaff]);

  /* save notes */
  const saveNotes = useCallback(
    (list: EmployeeNote[]) => {
      if (!user) return;
      const key = `cleanfix_employee_notes_${matchedStaff?.id || user.name}`;
      localStorage.setItem(key, JSON.stringify(list));
    },
    [user, matchedStaff]
  );

  /* build notifications from bookings */
  useEffect(() => {
    if (!matchedStaff) return;
    const myId = matchedStaff.id;
    const list: NotificationItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allBookings.forEach((b) => {
      if (b.staffId !== myId) return;
      if (b.status === "PENDING") {
        const d = typeof b.date === "string" ? new Date(b.date) : b.date;
        const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 1) {
          list.push({
            id: `new-${b.id}`,
            title: "Yeni Randevu Atandı",
            message: `${b.customer?.name || "Müşteri"} için ${b.service?.name || "Hizmet"} — ${formatDate(b.date)} ${b.time}`,
            time: diff === 0 ? "Bugün" : "Yarın",
            type: "assignment",
          });
        }
      }
      if (b.status === "CANCELLED") {
        list.push({
          id: `cancel-${b.id}`,
          title: "Randevu İptal Edildi",
          message: `${b.customer?.name || "Müşteri"} randevusu iptal edildi.`,
          time: "Beklemede",
          type: "cancel",
        });
      }
    });
    setNotifications(list.slice(0, 6));
  }, [allBookings, matchedStaff]);

  /* clear action msg */
  useEffect(() => {
    if (!actionMsg) return;
    const t = setTimeout(() => setActionMsg(null), 3000);
    return () => clearTimeout(t);
  }, [actionMsg]);

  /* derived data */
  const staffId = matchedStaff?.id;
  const myBookings = staffId
    ? allBookings.filter((b) => b.staffId === staffId)
    : allBookings;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = myBookings.filter((b) => {
    const d = typeof b.date === "string" ? new Date(b.date) : b.date;
    return isSameDay(d, today);
  });

  /* weekly schedule (Mon-Fri) */
  const monday = startOfWeek(today);
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(monday, i));
  const weeklyData = weekDays.map((day) => {
    const dayBookings = myBookings.filter((b) => {
      const d = typeof b.date === "string" ? new Date(b.date) : b.date;
      return isSameDay(d, day);
    });
    const totalHours = dayBookings.reduce((sum, b) => {
      const [h, m] = b.time.split(":").map(Number);
      return sum + (isNaN(h) ? 0 : 1.5); // assume 1.5h per booking
    }, 0);
    return {
      date: day,
      dayName: getDayNameTR(day),
      shortName: getDayNameTR(day).slice(0, 3),
      tasks: dayBookings.length,
      totalHours,
      bookings: dayBookings,
      isToday: isSameDay(day, today),
    };
  });

  /* performance: this month vs last month */
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthCompleted = myBookings.filter((b) => {
    const d = typeof b.date === "string" ? new Date(b.date) : b.date;
    return b.status === "COMPLETED" && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const lastMonthCompleted = myBookings.filter((b) => {
    const d = typeof b.date === "string" ? new Date(b.date) : b.date;
    return b.status === "COMPLETED" && d.getMonth() === lastMonth && d.getFullYear() === lastYear;
  }).length;

  const perfDiff = thisMonthCompleted - lastMonthCompleted;
  const perfPercent = lastMonthCompleted > 0 ? Math.round((perfDiff / lastMonthCompleted) * 100) : 0;

  /* work schedule timeline (09:00-17:00) */
  const timeSlots = Array.from({ length: 9 }, (_, i) => 9 + i); // 9-17
  const todaySlots = timeSlots.map((hour) => {
    const slotBookings = todayTasks.filter((b) => {
      const [h] = b.time.split(":").map(Number);
      return h === hour;
    });
    return { hour, bookings: slotBookings };
  });

  /* handlers */
  async function handleStartTask(id: string) {
    const res = await updateBookingStatus(id, "IN_PROGRESS");
    if (res.success) {
      setActionMsg({ type: "ok", text: "Görev başlatıldı." });
      setAllBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "IN_PROGRESS" } : b)));
    } else {
      setActionMsg({ type: "err", text: res.error || "Başlatılamadı." });
    }
  }

  async function handleCompleteTask(id: string) {
    const res = await updateBookingStatus(id, "COMPLETED");
    if (res.success) {
      setActionMsg({ type: "ok", text: "Görev tamamlandı." });
      setAllBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "COMPLETED" } : b)));
    } else {
      setActionMsg({ type: "err", text: res.error || "Tamamlanamadı." });
    }
  }

  function handleAddNote() {
    if (!noteInput.trim()) return;
    const newNote: EmployeeNote = {
      id: `note-${Date.now()}`,
      text: noteInput.trim(),
      createdAt: new Date().toISOString(),
    };
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

  /* render */
  const userGradient = user ? getGradient(user.name + user.email) : GRADIENTS[0];
  const unreadCount = notifications.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  const allowedRoles = ["EMPLOYEE", "MANAGER", "ADMIN"];
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Erişim Reddedildi</h2>
          <p className="text-sm text-slate-400 mb-6">
            Bu sayfa sadece çalışanlar, yöneticiler ve adminler için erişilebilir.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Çalışan Profili"
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {/* Action Toast */}
      {actionMsg && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border text-sm font-medium shadow-lg flex items-center gap-2 transition-all",
            actionMsg.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          )}
        >
          {actionMsg.type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {actionMsg.text}
        </div>
      )}

      {/* Top Row: Profile + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg",
                userGradient.from,
                userGradient.to
              )}
            >
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-100 truncate">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mt-1",
                  user.role === "ADMIN"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : user.role === "MANAGER"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}
              >
                {user.role === "ADMIN" ? "Admin" : user.role === "MANAGER" ? "Yönetici" : "Çalışan"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Bildirimler
                        </span>
                        <span className="text-xs text-slate-500">{notifications.length}</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-slate-500">Yeni bildirim yok</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={cn(
                                    "mt-0.5 w-2 h-2 rounded-full shrink-0",
                                    n.type === "assignment" ? "bg-blue-400" : n.type === "cancel" ? "bg-rose-400" : "bg-slate-400"
                                  )}
                                />
                                <div>
                                  <p className="text-sm font-medium text-slate-200">{n.title}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                                  <p className="text-[11px] text-slate-500 mt-1">{n.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
          {matchedStaff && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3">
                <p className="text-xs text-slate-500 mb-0.5">Telefon</p>
                <p className="text-sm text-slate-200">{matchedStaff.phone || "—"}</p>
              </div>
              <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3">
                <p className="text-xs text-slate-500 mb-0.5">Başlangıç</p>
                <p className="text-sm text-slate-200">
                  {matchedStaff.createdAt ? formatDate(matchedStaff.createdAt) : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-800/50 border border-slate-800 p-3">
                <p className="text-xs text-slate-500 mb-0.5">Durum</p>
                <p className="text-sm text-slate-200">
                  {matchedStaff.active !== false ? "Aktif" : "Pasif"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Bu Ay Tamamlanan</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{thisMonthCompleted}</p>
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
            <span className="text-xs text-slate-500">· Geçen ay: {lastMonthCompleted}</span>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden animate-pulse"
            >
              <div className="px-5 py-4 border-b border-slate-800 h-12 bg-slate-800/30" />
              <div className="p-5 space-y-3">
                <div className="h-16 rounded-lg bg-slate-800/30" />
                <div className="h-16 rounded-lg bg-slate-800/30" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-200">Bugünkü Görevlerim</h3>
              </div>
              <span className="text-xs text-slate-500">
                {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            <div className="p-5">
              {todayTasks.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Bugün için görev yok</p>
                  <p className="text-xs text-slate-500 mt-1">Mükemmel! Bugünkü programınız boş.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{task.service?.name || "Hizmet"}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={12} />
                            {task.time}
                          </p>
                        </div>
                        {statusBadge(task.status)}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <User size={12} />
                          {task.customer?.name || "Müşteri"}
                          {task.customer?.address && (
                            <span className="flex items-center gap-1 ml-2">
                              <MapPin size={12} />
                              {task.customer.address}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === "PENDING" && (
                            <button
                              onClick={() => handleStartTask(task.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                            >
                              <Play size={12} />
                              Başlat
                            </button>
                          )}
                          {task.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                            >
                              <CheckCircle2 size={12} />
                              Tamamla
                            </button>
                          )}
                          {task.status === "COMPLETED" && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Tamamlandı
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {todaySlots.map((slot) => {
                  const hasTask = slot.bookings.length > 0;
                  return (
                    <div key={slot.hour} className="flex items-center gap-3">
                      <span className="w-10 text-xs text-slate-500 text-right shrink-0">
                        {String(slot.hour).padStart(2, "0")}:00
                      </span>
                      <div className="flex-1 h-8 rounded-md border border-slate-800 bg-slate-800/30 flex items-center px-2 gap-1 overflow-hidden">
                        {hasTask ? (
                          slot.bookings.map((b) => (
                            <div
                              key={b.id}
                              className={cn(
                                "px-2 py-0.5 rounded text-[11px] font-medium truncate border",
                                b.status === "IN_PROGRESS"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/20"
                                  : b.status === "COMPLETED"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                                  : "bg-blue-500/15 text-blue-300 border-blue-500/20"
                              )}
                              title={`${b.service?.name} — ${b.customer?.name}`}
                            >
                              {b.service?.name || "Hizmet"} · {b.customer?.name || ""}
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
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (todayTasks.length / 6) * 100)}%` }}
                  />
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
              <span className="text-xs text-slate-500">
                {formatDate(weekDays[0])} — {formatDate(weekDays[4])}
              </span>
            </div>
            <div className="p-5 space-y-2">
              {weeklyData.map((day) => (
                <div
                  key={day.dayName}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    day.isToday ? "bg-blue-500/5 border-blue-500/20" : "bg-slate-800/50 border-slate-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium",
                        day.isToday ? "bg-blue-500/15 text-blue-300" : "bg-slate-800 text-slate-400"
                      )}
                    >
                      {day.shortName.charAt(0)}
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", day.isToday ? "text-blue-300" : "text-slate-200")}>
                        {day.dayName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {day.tasks > 0 ? `${day.totalHours.toFixed(1)} saat` : "Boş"}
                      </p>
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

          {/* Completed Jobs Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-yellow-400" />
                <h3 className="text-sm font-semibold text-slate-200">Genel Performans</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Toplam Tamamlanan</span>
                <span className="text-lg font-bold text-slate-100">
                  {myBookings.filter((b) => b.status === "COMPLETED").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Bekleyen</span>
                <span className="text-sm font-medium text-amber-400">
                  {myBookings.filter((b) => b.status === "PENDING").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Devam Eden</span>
                <span className="text-sm font-medium text-purple-400">
                  {myBookings.filter((b) => b.status === "IN_PROGRESS").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">İptal</span>
                <span className="text-sm font-medium text-rose-400">
                  {myBookings.filter((b) => b.status === "CANCELLED").length}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Verimlilik</span>
                  <span className="text-slate-200 font-medium">
                    {myBookings.length > 0
                      ? `${Math.round(
                          (myBookings.filter((b) => b.status === "COMPLETED").length / myBookings.length) * 100
                        )}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        myBookings.length > 0
                          ? Math.round(
                              (myBookings.filter((b) => b.status === "COMPLETED").length / myBookings.length) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
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
              {noteSaving && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Kaydedildi
                </span>
              )}
            </div>
            <div className="p-5 space-y-4">
              {/* Note list */}
              {notes.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.text}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {new Date(note.createdAt).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add note */}
              <div className="flex items-end gap-3">
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Yeni not ekleyin..."
                  className="flex-1 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none placeholder:text-slate-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteInput.trim()}
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
