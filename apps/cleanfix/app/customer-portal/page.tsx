"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
  CalendarDays,
  Receipt,
  User,
  Clock,
  MapPin,
  Phone,
  Plus,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Star,
  FileText,
  Bell,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@kobipro/ui";
import {
  getBookings,
  updateBookingStatus,
} from "@/app/actions/bookings";
import { getInvoices } from "@/app/actions/invoices";
import { getServices } from "@/app/actions/services";
import { getCustomers, updateCustomer } from "@/app/actions/customers";
import { createBooking } from "@/app/actions/bookings";

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
  customer?: { id: string; name: string; email?: string | null };
  service?: { id: string; name: string };
  staff?: { id: string; name: string } | null;
}

interface Invoice {
  id: string;
  customerId: string;
  amount: number | DecimalLike;
  status: string;
  dueDate: Date | string;
  paidDate?: Date | string | null;
  createdAt?: Date | string;
  customer?: { id: string; name: string };
  number?: string;
  total?: number;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface Service {
  id: string;
  name: string;
  price: number | DecimalLike;
  duration: number;
}

interface DecimalLike {
  toString(): string;
}

interface NotificationItem {
  id: string;
  type: "booking" | "invoice" | "quote" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
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

function formatTime(t: string) {
  return t;
}

function toNum(v: number | DecimalLike | undefined): number {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return v;
  return parseFloat(v.toString());
}

function isActive(status: string) {
  return status !== "COMPLETED" && status !== "CANCELLED";
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

function invoiceStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    DRAFT: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20", label: "Taslak" },
    SENT: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "Gönderildi" },
    PAID: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Ödendi" },
    OVERDUE: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", label: "Gecikmiş" },
    CANCELLED: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", label: "İptal" },
  };
  const s = map[status] || map.DRAFT;
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
export default function CustomerPortalPage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  /* data */
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);

  /* UI state */
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  /* form states */
  const [newServiceId, setNewServiceId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newNotes, setNewNotes] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  /* profile edit */
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

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
    const [bkRes, invRes, svcRes, custRes] = await Promise.all([
      getBookings(),
      getInvoices(),
      getServices(),
      getCustomers(),
    ]);

    if (bkRes.success) setAllBookings((bkRes.data || []) as unknown as Booking[]);
    if (invRes.success) setAllInvoices(invRes.data || []);
    if (svcRes.success) setServices(svcRes.data || []);
    if (custRes.success) {
      const c = (custRes.data || []) as Customer[];
      setCustomers(c);
      /* match customer by email, then by name */
      const byEmail = c.find((x) => x.email && x.email.toLowerCase() === user.email.toLowerCase());
      const byName = c.find((x) => x.name.toLowerCase() === user.name.toLowerCase());
      const matched = byEmail || byName || null;
      setMatchedCustomer(matched);
      if (matched) {
        setEditPhone(matched.phone || "");
        setEditAddress(matched.address || "");
        setEditNotes(matched.notes || "");
      }
    }
    setDataLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  /* derive filtered data */
  const myCustomerId = matchedCustomer?.id;
  const myBookings = myCustomerId
    ? allBookings.filter((b) => b.customerId === myCustomerId)
    : allBookings;

  const activeBookings = myBookings.filter((b) => isActive(b.status));
  const pastBookings = myBookings.filter((b) => b.status === "COMPLETED");

  const myInvoices = myCustomerId
    ? allInvoices.filter((inv) => inv.customerId === myCustomerId)
    : allInvoices;

  /* build notifications from real data */
  useEffect(() => {
    const list: NotificationItem[] = [];
    activeBookings.forEach((b) => {
      const d = typeof b.date === "string" ? new Date(b.date) : b.date;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bDate = new Date(d);
      bDate.setHours(0, 0, 0, 0);
      const diff = Math.floor((bDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff <= 2) {
        list.push({
          id: `bk-${b.id}`,
          type: "booking",
          title: "Randevu Hatırlatma",
          message: `${b.service?.name || "Hizmet"} randevunuz ${diff === 0 ? "bugün" : diff === 1 ? "yarın" : "2 gün sonra"} ${b.time}'de.`,
          time: diff === 0 ? "Bugün" : diff === 1 ? "Yarın" : "2 gün sonra",
          read: false,
        });
      }
    });
    myInvoices
      .filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE")
      .forEach((inv) => {
        list.push({
          id: `inv-${inv.id}`,
          type: "invoice",
          title: "Fatura Ödeme",
          message: `Fatura #${inv.number || inv.id.slice(0, 6)} için ödeme bekleniyor.`,
          time: "Beklemede",
          read: false,
        });
      });
    /* dedupe by id */
    const map = new Map<string, NotificationItem>();
    list.forEach((n) => map.set(n.id, n));
    setNotifications(Array.from(map.values()));
  }, [activeBookings, myInvoices]);

  /* clear action msg */
  useEffect(() => {
    if (!actionMsg) return;
    const t = setTimeout(() => setActionMsg(null), 3000);
    return () => clearTimeout(t);
  }, [actionMsg]);

  /* handlers */
  async function handleCancelBooking(id: string) {
    const res = await updateBookingStatus(id, "CANCELLED");
    if (res.success) {
      setActionMsg({ type: "ok", text: "Randevu iptal edildi." });
      setAllBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } else {
      setActionMsg({ type: "err", text: res.error || "İptal edilemedi." });
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!newServiceId || !newDate) {
      setActionMsg({ type: "err", text: "Lütfen hizmet ve tarih seçin." });
      return;
    }
    const custId = matchedCustomer?.id || customers[0]?.id || "demo-customer";
    setFormSubmitting(true);
    const res = await createBooking({
      customerId: custId,
      serviceId: newServiceId,
      date: newDate,
      time: newTime,
      notes: newNotes,
      status: "PENDING",
    });
    setFormSubmitting(false);
    if (!res.success) {
      setActionMsg({ type: "err", text: res.error || "Randevu oluşturulamadı." });
    } else if (res.data) {
      setActionMsg({ type: "ok", text: "Randevu başarıyla oluşturuldu!" });
      setAllBookings((prev) => [res.data as Booking, ...prev]);
      setShowNewBooking(false);
      setNewServiceId("");
      setNewDate("");
      setNewTime("09:00");
      setNewNotes("");
    }
  }

  async function handleSaveProfile() {
    if (!matchedCustomer) {
      setActionMsg({ type: "err", text: "Müşteri kaydı bulunamadı." });
      return;
    }
    setProfileSaving(true);
    const res = await updateCustomer(matchedCustomer.id, {
      phone: editPhone,
      address: editAddress,
      notes: editNotes,
    });
    setProfileSaving(false);
    if (res.success) {
      setProfileSaved(true);
      setActionMsg({ type: "ok", text: "Profil güncellendi." });
      setMatchedCustomer((prev) =>
        prev
          ? { ...prev, phone: editPhone, address: editAddress, notes: editNotes }
          : prev
      );
      setTimeout(() => setProfileSaved(false), 2000);
    } else {
      setActionMsg({ type: "err", text: res.error || "Güncellenemedi." });
    }
  }

  function handleLogout() {
    document.cookie = "demo_login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }

  /* total spent */
  const totalSpent = myInvoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + toNum(inv.total ?? inv.amount), 0);

  /* render helpers */
  const userGradient = user ? getGradient(user.name + user.email) : GRADIENTS[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  if (!user || user.role !== "CUSTOMER") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <User size={22} className="text-rose-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">
            Bu sayfa sadece müşteriler içindir
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Müşteri portalına erişmek için lütfen müşteri hesabı ile giriş yapın.
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
      pageTitle="Müşteri Portalı"
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

      {/* Welcome + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Welcome Card */}
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
              <h2 className="text-lg font-semibold text-slate-100 truncate">
                Hoş geldiniz, {user.name}
              </h2>
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Clock size={14} />
                Son giriş: {new Date().toLocaleDateString("tr-TR")}
              </p>
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
                          <div className="px-4 py-6 text-center text-sm text-slate-500">
                            Yeni bildirim yok
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                "px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors",
                                !n.read && "bg-slate-800/20"
                              )}
                            >
                              <div className="flex items-start gap-2.5">
                                <div
                                  className={cn(
                                    "mt-0.5 w-2 h-2 rounded-full shrink-0",
                                    n.type === "booking"
                                      ? "bg-blue-400"
                                      : n.type === "invoice"
                                      ? "bg-amber-400"
                                      : "bg-slate-400"
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
        </div>

        {/* Quick Stats */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Toplam Harcama</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">
                ₺{totalSpent.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <Wallet size={20} className="text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {activeBookings.length} aktif randevu
            </span>
            <span className="flex items-center gap-1">
              <Receipt size={12} />
              {myInvoices.filter((i) => i.status === "PAID").length} ödenmiş fatura
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowNewBooking(!showNewBooking)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {showNewBooking ? "Formu Kapat" : "Yeni Randevu Al"}
        </button>
        <button
          onClick={() => setShowProfileEdit(!showProfileEdit)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
        >
          <User size={16} />
          {showProfileEdit ? "Profili Gizle" : "Profili Düzenle"}
        </button>
      </div>

      {/* New Booking Inline Form */}
      {showNewBooking && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Yeni Randevu</h3>
          </div>
          <form onSubmit={handleCreateBooking} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Hizmet</label>
              <select
                value={newServiceId}
                onChange={(e) => setNewServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="">Hizmet seçin</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — ₺{toNum(s.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Tarih</label>
              <input
                type="date"
                value={newDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Saat</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5">Notlar</label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Eklemek istediğiniz notlar..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none placeholder:text-slate-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewBooking(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors border border-slate-700"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {formSubmitting && <Loader2 size={14} className="animate-spin" />}
                Randevu Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Edit Inline */}
      {showProfileEdit && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
            <User size={18} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">Profil Bilgilerim</h3>
            {profileSaved && (
              <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                Kaydedildi
              </span>
            )}
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Ad Soyad</label>
              <input
                type="text"
                defaultValue={user.name}
                disabled
                className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">E-posta</label>
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <Phone size={12} />
                Telefon
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+90 555 123 45 67"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <MapPin size={12} />
                Adres
              </label>
              <textarea
                rows={2}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Adresinizi girin..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <FileText size={12} />
                Notlar
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Ek notlar..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700 disabled:opacity-50"
              >
                {profileSaving && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Grid */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          {/* Active Bookings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-200">Aktif Randevularım</h3>
              </div>
              <span className="text-xs text-slate-500">{activeBookings.length}</span>
            </div>
            <div className="p-5">
              {activeBookings.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarDays size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Henüz aktif randevunuz yok</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Yeni bir randevu almak için yukarıdaki butonu kullanın.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {booking.service?.name || "Hizmet"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(booking.date)} · {formatTime(booking.time)}
                          </p>
                        </div>
                        {statusBadge(booking.status)}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <User size={12} />
                          {booking.staff?.name || "Atanmadı"}
                        </p>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                        >
                          <X size={12} />
                          İptal Et
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Past Bookings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-200">Geçmiş Randevularım</h3>
              </div>
              <span className="text-xs text-slate-500">{pastBookings.length}</span>
            </div>
            <div className="p-5">
              {pastBookings.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Henüz geçmiş randevunuz yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {booking.service?.name || "Hizmet"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(booking.date)} · {formatTime(booking.time)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <User size={12} />
                          {booking.staff?.name || "Atanmadı"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {statusBadge(booking.status)}
                        <button
                          onClick={() => {
                            setNewServiceId(booking.serviceId);
                            setShowNewBooking(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors ml-auto"
                        >
                          <RotateCcw size={12} />
                          Tekrar Al
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Fatura Geçmişim</h3>
              </div>
              <span className="text-xs text-slate-500">{myInvoices.length}</span>
            </div>
            <div className="p-5">
              {myInvoices.length === 0 ? (
                <div className="text-center py-6">
                  <Receipt size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Henüz faturanız yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          #{inv.number || inv.id.slice(0, 6).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(inv.createdAt)} · {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-slate-200">
                          ₺{toNum(inv.total ?? inv.amount).toLocaleString("tr-TR")}
                        </p>
                        <div className="mt-1">{invoiceStatusBadge(inv.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200">Son Aktiviteler</h3>
              </div>
            </div>
            <div className="p-5">
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Bell size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Yeni aktivite yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800"
                    >
                      <div
                        className={cn(
                          "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          n.type === "booking"
                            ? "bg-blue-500/10 text-blue-400"
                            : n.type === "invoice"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-500/10 text-slate-400"
                        )}
                      >
                        {n.type === "booking" ? (
                          <CalendarDays size={14} />
                        ) : n.type === "invoice" ? (
                          <Receipt size={14} />
                        ) : (
                          <Bell size={14} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
