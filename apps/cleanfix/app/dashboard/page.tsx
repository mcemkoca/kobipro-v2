"use client";

import { useState, useEffect, useMemo } from "react";
import { getDemoUser } from "@/lib/auth";
import { getBookings } from "../actions/bookings";
import { getCustomers } from "../actions/customers";
import { getInvoices } from "../actions/invoices";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { SkeletonTable } from "../components/ui/SkeletonTable";
import { ErrorState } from "../components/ui/ErrorState";
import {
  CalendarDays,
  Users,
  Banknote,
  Receipt,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@kobipro/ui";

interface DemoUser {
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  title: string;
  value: string;
  hasData: boolean;
  change?: string;
  changeUp?: boolean;
  icon: typeof CalendarDays;
  iconBg: string;
  iconColor: string;
}

const statusMap: Record<string, string> = {
  COMPLETED: "Tamamlandı",
  CONFIRMED: "Onaylandı",
  IN_PROGRESS: "Devam Ediyor",
  PENDING: "Beklemede",
  CANCELLED: "İptal",
};

const statusStyles: Record<string, string> = {
  "Tamamlandı": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Onaylandı": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Devam Ediyor": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Beklemede": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "İptal": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getMonthKey(d: Date | string): string {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [, month] = key.split("-");
  const labels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return labels[parseInt(month, 10) - 1];
}

function getLastNMonths(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function SimpleBarChart({
  data,
}: {
  data: { label: string; bars: { value: number; color: string }[] }[];
}) {
  const allValues = data.flatMap((d) => d.bars.map((b) => b.value));
  const max = Math.max(...(allValues.length ? allValues : [1]));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-40">
        {data.map((group, gi) => (
          <div key={gi} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="flex items-end gap-0.5 w-full h-32">
              {group.bars.map((bar, bi) => {
                const pct = max > 0 ? (bar.value / max) * 100 : 0;
                return (
                  <div
                    key={bi}
                    className={cn("flex-1 rounded-t-sm transition-all", bar.color)}
                    style={{ height: `${pct}%` }}
                    title={`${formatCurrency(bar.value)}`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-slate-500 uppercase text-center leading-tight">{group.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const u = await getDemoUser();
        if (!u) {
          window.location.href = "/login";
          return;
        }
        setUser(u);

        const [bkRes, cuRes, invRes, stRes] = await Promise.all([
          getBookings(),
          getCustomers(),
          getInvoices(),
          import("../actions/staff").then((m) => m.getStaff()),
        ]);

        if (bkRes.success) setBookings(bkRes.data || []);
        if (cuRes.success) setCustomers(cuRes.data || []);
        if (invRes.success) setInvoices(invRes.data || []);
        if (stRes.success) setStaff(stRes.data || []);

        if (!bkRes.success || !cuRes.success || !invRes.success || !stRes.success) {
          setError("Bazı veriler yüklenirken hata oluştu");
        }
      } catch (err) {
        setError("Dashboard yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (!user && loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-500 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) return null;

  const monthKeys6 = useMemo(() => getLastNMonths(6), []);

  const revenueByMonth = useMemo(() => {
    const map: Record<string, { total: number; paid: number; unpaid: number }> = {};
    monthKeys6.forEach((k) => (map[k] = { total: 0, paid: 0, unpaid: 0 }));
    invoices.forEach((inv) => {
      const key = getMonthKey(inv.createdAt);
      if (!map[key]) return;
      const amt = Number(inv.amount || inv.total || 0);
      map[key].total += amt;
      if (inv.status === "PAID") map[key].paid += amt;
      else map[key].unpaid += amt;
    });
    return monthKeys6.map((k) => ({ key: k, label: getMonthLabel(k), ...map[k] }));
  }, [invoices, monthKeys6]);

  const hasRevenueData = revenueByMonth.some((m) => m.total > 0);

  /* ---------- Trend hesaplamaları ---------- */
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);

  const bookingsLast30 = bookings.filter((b) => new Date(b.createdAt) >= thirtyDaysAgo).length;
  const bookingsPrev30 = bookings.filter((b) => { const d = new Date(b.createdAt); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).length;
  const bookingsChange = bookingsPrev30 === 0 ? (bookingsLast30 > 0 ? 100 : 0) : Math.round(((bookingsLast30 - bookingsPrev30) / bookingsPrev30) * 100);

  const customersLast30 = customers.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo).length;
  const customersPrev30 = customers.filter((c) => { const d = new Date(c.createdAt); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).length;
  const customersChange = customersPrev30 === 0 ? (customersLast30 > 0 ? 100 : 0) : Math.round(((customersLast30 - customersPrev30) / customersPrev30) * 100);

  const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
  const pendingInvoices = invoices.filter((inv) => inv.status !== "PAID");
  const revenueLast30 = paidInvoices.filter((inv) => new Date(inv.paidDate || inv.createdAt) >= thirtyDaysAgo).reduce((sum, inv) => sum + Number(inv.amount || inv.total || 0), 0);
  const revenuePrev30 = paidInvoices.filter((inv) => { const d = new Date(inv.paidDate || inv.createdAt); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).reduce((sum, inv) => sum + Number(inv.amount || inv.total || 0), 0);
  const revenueChange = revenuePrev30 === 0 ? (revenueLast30 > 0 ? 100 : 0) : Math.round(((revenueLast30 - revenuePrev30) / revenuePrev30) * 100);

  const pendingLast30 = pendingInvoices.filter((inv) => new Date(inv.createdAt) >= thirtyDaysAgo).length;
  const pendingPrev30 = pendingInvoices.filter((inv) => { const d = new Date(inv.createdAt); return d >= sixtyDaysAgo && d < thirtyDaysAgo; }).length;
  const pendingChange = pendingPrev30 === 0 ? (pendingLast30 > 0 ? 100 : 0) : Math.round(((pendingLast30 - pendingPrev30) / pendingPrev30) * 100);

  /* ---------- Bugünün randevuları ---------- */
  const todayStr = now.toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => new Date(b.date).toISOString().slice(0, 10) === todayStr && b.status !== "CANCELLED");

  /* ---------- Personel performansı ---------- */
  const activeStaff = staff.filter((s) => s.active !== false);
  const topStaff = [...activeStaff].sort((a, b) => (b.jobs || 0) - (a.jobs || 0)).slice(0, 3);

  const stats: DashboardStats[] = [
    {
      title: "Toplam Randevu",
      value: bookings.length.toLocaleString("tr-TR"),
      hasData: bookings.length > 0,
      change: `${Math.abs(bookingsChange)}%`,
      changeUp: bookingsChange >= 0,
      icon: CalendarDays,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      title: "Aktif Müşteri",
      value: customers.length.toLocaleString("tr-TR"),
      hasData: customers.length > 0,
      change: `${Math.abs(customersChange)}%`,
      changeUp: customersChange >= 0,
      icon: Users,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      title: "Aylık Gelir",
      value: formatCurrency(revenueLast30),
      hasData: revenueLast30 > 0,
      change: `${Math.abs(revenueChange)}%`,
      changeUp: revenueChange >= 0,
      icon: Banknote,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    {
      title: "Bekleyen Fatura",
      value: pendingInvoices.length.toLocaleString("tr-TR"),
      hasData: pendingInvoices.length > 0,
      change: `${Math.abs(pendingChange)}%`,
      changeUp: pendingChange <= 0,
      icon: Receipt,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
    },
  ];

  const recentBookings = bookings.slice(0, 8);

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm">
          Hoş geldiniz, {user.name}
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <SkeletonCard count={4} className="mb-8" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-100 mt-2">{stat.value}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-lg", stat.iconBg)}>
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                </div>
                {stat.hasData && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {stat.changeUp ? (
                      <TrendingUp size={14} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={14} className="text-rose-400" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        stat.changeUp ? "text-emerald-400" : "text-rose-400"
                      )}
                    >
                      {stat.change || "0%"}
                    </span>
                    <span className="text-xs text-slate-600">son 30 gün</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6">
          <ErrorState
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href="/bookings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Yeni Randevu
        </a>
        <a
          href="/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
        >
          <Users size={16} />
          Yeni Müşteri
        </a>
        <a
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
        >
          <Receipt size={16} />
          Yeni Fatura
        </a>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bugünün Randevuları + Personel — sağ kolon üstte mobilde */}
        <div className="xl:col-span-1 space-y-6 order-first xl:order-last">
          {/* Bugünün Randevuları */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Bugünün Randevuları</h2>
              <span className="text-xs text-slate-500">{todayBookings.length} adet</span>
            </div>
            {todayBookings.length === 0 ? (
              <div className="p-5 text-center">
                <CalendarDays size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Bugün randevu yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {todayBookings.map((b) => (
                  <div key={b.id} className="px-5 py-3 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">{b.customer?.name || "Müşteri"}</p>
                      <span className="text-xs text-slate-400">{b.time || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500">{b.service?.name || "Hizmet"}</p>
                      <span className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                        b.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        b.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        b.status === "CONFIRMED" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {statusMap[b.status] || b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personel Performansı */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Personel Performansı</h2>
            </div>
            {topStaff.length === 0 ? (
              <div className="p-5 text-center">
                <Users size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Henüz personel kaydı yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {topStaff.map((s) => (
                  <div key={s.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {s.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{s.name}</p>
                          <p className="text-xs text-slate-500">{s.displayRole || s.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-100">{s.jobs || 0}</p>
                        <p className="text-[10px] text-slate-500">iş tamamladı</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, ((s.jobs || 0) / 50) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-3 border-t border-slate-800">
              <a href="/staff" className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                Tüm personel <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Son Randevular + Gelir — sol kolon */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Bookings */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Son Randevular</h2>
              <a
                href="/bookings"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Tümünü gör
                <ArrowRight size={14} />
              </a>
            </div>
            {loading ? (
              <SkeletonTable columns={6} rows={5} />
            ) : recentBookings.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={CalendarDays}
                  title="Henüz randevu yok"
                  description="İlk randevu oluşturduğunuzda burada görünecek"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">ID</th>
                      <th className="px-5 py-3 font-medium">Müşteri</th>
                      <th className="px-5 py-3 font-medium">Hizmet</th>
                      <th className="px-5 py-3 font-medium">Tarih</th>
                      <th className="px-5 py-3 font-medium">Durum</th>
                      <th className="px-5 py-3 font-medium text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {recentBookings.map((booking) => {
                      const displayStatus = statusMap[booking.status] || booking.status;
                      return (
                        <tr
                          key={booking.id}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                            {booking.id?.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-5 py-3 text-slate-200 font-medium">
                            {booking.customer?.name || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-400">
                            {booking.service?.name || "—"}
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-xs">
                            {formatDate(booking.date)}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
                                statusStyles[displayStatus] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              )}
                            >
                              {displayStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-200 font-medium text-right">
                            {booking.service?.price ? formatCurrency(Number(booking.service.price)) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Gelir Özeti</h2>
              <p className="text-xs text-slate-500 mt-0.5">Son 6 ay</p>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-pulse h-32 w-full bg-slate-800 rounded-lg" />
                </div>
              ) : !hasRevenueData ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                  <Banknote size={32} className="text-slate-700 mb-3" />
                  <p className="text-sm">Henüz fatura kaydı yok</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Faturalandırma başladığında grafik oluşacak
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <SimpleBarChart
                    data={revenueByMonth.map((m) => ({
                      label: m.label,
                      bars: [
                        { value: m.total, color: "bg-blue-500/60" },
                        { value: m.paid, color: "bg-emerald-500/60" },
                        { value: m.unpaid, color: "bg-rose-500/60" },
                      ],
                    }))}
                  />
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500/60" />
                      <span className="text-slate-400">Toplam</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                      <span className="text-slate-400">Ödenen</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-500/60" />
                      <span className="text-slate-400">Ödenmemiş</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
