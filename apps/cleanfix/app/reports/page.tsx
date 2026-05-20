"use client";

import { useState, useEffect, useMemo } from "react";
import { getDemoUser, hasRole } from "@/lib/auth";
import { getBookings } from "../actions/bookings";
import { getCustomers } from "../actions/customers";
import { getServices } from "../actions/services";
import { getInvoices } from "../actions/invoices";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { SkeletonTable } from "../components/ui/SkeletonTable";
import { ErrorState } from "../components/ui/ErrorState";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  Receipt,
  Wrench,
  Shield,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  UserPlus,
} from "lucide-react";
import { cn } from "@kobipro/ui";

interface DemoUser {
  name: string;
  email: string;
  role: string;
}

type TabKey = "revenue" | "customers" | "bookings" | "invoices" | "services" | "overview";

const tabs: { key: TabKey; label: string; icon: typeof TrendingUp }[] = [
  { key: "revenue", label: "Gelir", icon: TrendingUp },
  { key: "customers", label: "Müşteri", icon: Users },
  { key: "bookings", label: "Randevu", icon: Calendar },
  { key: "invoices", label: "Fatura", icon: Receipt },
  { key: "services", label: "Hizmet", icon: Wrench },
  { key: "overview", label: "Genel Özet", icon: BarChart3 },
];

function formatCurrency(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthKey(d: Date | string): string {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const labels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${labels[parseInt(month, 10) - 1]} ${year}`;
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

function addMonths(key: string, n: number): string {
  const [year, month] = key.split("-").map(Number);
  const d = new Date(year, month - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysBetween(a: Date | string, b: Date | string): number {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function isWithinDays(date: Date | string, days: number): boolean {
  const d = new Date(date).getTime();
  const now = Date.now();
  return now - d <= days * 24 * 60 * 60 * 1000;
}

/* ---------- Small UI helpers ---------- */

function MiniBar({ value, max, colorClass, label }: { value: number; max: number; colorClass: string; label?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", colorClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StackedBar({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="w-full">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-800">
        {segments.map((s, i) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <div
              key={i}
              className={cn("h-full transition-all", s.color)}
              style={{ width: `${pct}%` }}
              title={`${s.label}: ${formatCurrency(s.value)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className={cn("w-2 h-2 rounded-full", s.color)} />
            <span className="text-slate-400">{s.label}</span>
            <span className="text-slate-300 font-medium">{formatCurrency(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({
  data,
  colors,
}: {
  data: { label: string; bars: { value: number; color: string }[] }[];
  colors?: string[];
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

function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof TrendingUp;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-100 mt-2">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={cn("p-2.5 rounded-lg", iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

function ChangeBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    if (current === 0) return <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Minus size={12} /> 0%</span>;
    return <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><ArrowUpRight size={12} /> Yeni</span>;
  }
  const diff = ((current - previous) / previous) * 100;
  const isUp = diff >= 0;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", isUp ? "text-emerald-400" : "text-rose-400")}>
      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(diff).toFixed(1)}%
    </span>
  );
}

/* =========================================== */
export default function ReportsPage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("revenue");

  const [bookings, setBookings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const u = await getDemoUser();
        if (!u) {
          window.location.href = "/login";
          return;
        }
        setUser(u);

        const ok = await hasRole(["ADMIN", "MANAGER"]);
        setAuthorized(ok);
        if (!ok) {
          setLoading(false);
          return;
        }

        const [bkRes, cuRes, svRes, invRes] = await Promise.all([
          getBookings(),
          getCustomers(),
          getServices(),
          getInvoices(),
        ]);

        if (bkRes.success) setBookings(bkRes.data || []);
        if (cuRes.success) setCustomers(cuRes.data || []);
        if (svRes.success) setServices(svRes.data || []);
        if (invRes.success) setInvoices(invRes.data || []);

        if (!bkRes.success || !cuRes.success || !svRes.success || !invRes.success) {
          setError("Bazı veriler yüklenirken hata oluştu");
        }
      } catch (err) {
        setError("Raporlar yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  /* ---------- Computed data ---------- */

  const monthKeys6 = useMemo(() => getLastNMonths(6), []);

  const revenueByMonth = useMemo(() => {
    const map: Record<string, { total: number; paid: number; unpaid: number; overdue: number }> = {};
    monthKeys6.forEach((k) => (map[k] = { total: 0, paid: 0, unpaid: 0, overdue: 0 }));
    invoices.forEach((inv) => {
      const key = getMonthKey(inv.createdAt);
      if (!map[key]) return;
      const amt = Number(inv.amount || inv.total || 0);
      map[key].total += amt;
      if (inv.status === "PAID") map[key].paid += amt;
      else if (inv.status === "OVERDUE") map[key].overdue += amt;
      else map[key].unpaid += amt;
    });
    return monthKeys6.map((k) => ({ key: k, label: getMonthLabel(k), ...map[k] }));
  }, [invoices, monthKeys6]);

  const totalRevenue = useMemo(() => revenueByMonth.reduce((s, m) => s + m.paid, 0), [revenueByMonth]);
  const avgMonthlyRevenue = useMemo(() => (revenueByMonth.length ? totalRevenue / revenueByMonth.length : 0), [revenueByMonth, totalRevenue]);
  const highestMonth = useMemo(() => {
    if (!revenueByMonth.length) return null;
    return revenueByMonth.reduce((best, cur) => (cur.paid > best.paid ? cur : best), revenueByMonth[0]);
  }, [revenueByMonth]);

  const paidTotal = useMemo(() => invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.amount || i.total || 0), 0), [invoices]);
  const unpaidTotal = useMemo(() => invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + Number(i.amount || i.total || 0), 0), [invoices]);
  const overdueTotal = useMemo(() => invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + Number(i.amount || i.total || 0), 0), [invoices]);

  const totalCustomers = customers.length;
  const newCustomers30 = customers.filter((c) => isWithinDays(c.createdAt, 30)).length;
  const activeCustomers90 = useMemo(() => {
    const activeIds = new Set<string>();
    bookings.forEach((b) => {
      if (b.customerId && isWithinDays(b.date, 90)) activeIds.add(b.customerId);
    });
    return activeIds.size;
  }, [bookings]);

  const topCustomers = useMemo(() => {
    const spend: Record<string, { customer: any; total: number }> = {};
    invoices.forEach((inv) => {
      const cid = inv.customerId;
      if (!cid) return;
      if (!spend[cid]) spend[cid] = { customer: inv.customer || customers.find((c) => c.id === cid), total: 0 };
      spend[cid].total += Number(inv.amount || inv.total || 0);
    });
    return Object.values(spend)
      .filter((s) => s.customer)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [invoices, customers]);

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED").length;

  const weeklyOccupancy = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisWeek = bookings.filter((b) => {
      const d = new Date(b.date);
      return d >= startOfWeek && d < endOfWeek && b.status !== "CANCELLED";
    });
    // Assume 8 slots per day, 5 days = 40 slots/week
    const capacity = 40;
    return Math.min(100, Math.round((thisWeek.length / capacity) * 100));
  }, [bookings]);

  const popularDayHour = useMemo(() => {
    const dayCounts: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      const d = new Date(b.date);
      const day = d.toLocaleDateString("tr-TR", { weekday: "long" });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      const hour = b.time?.slice(0, 2) + ":00" || "—";
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    return { day: topDay, hour: topHour };
  }, [bookings]);

  const invoiceTotals = useMemo(() => {
    const total = invoices.reduce((s, i) => s + Number(i.amount || i.total || 0), 0);
    const paid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.amount || i.total || 0), 0);
    const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;
    const overdueAmt = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + Number(i.amount || i.total || 0), 0);
    const collectionRate = total > 0 ? (paid / total) * 100 : 0;

    const paidInvoices = invoices.filter((i) => i.status === "PAID" && i.paidDate && i.createdAt);
    const avgPaymentDays = paidInvoices.length
      ? Math.round(paidInvoices.reduce((sum, i) => sum + daysBetween(i.paidDate, i.createdAt), 0) / paidInvoices.length)
      : 0;

    const trend = monthKeys6.map((k) => {
      const monthInv = invoices.filter((i) => getMonthKey(i.createdAt) === k);
      return {
        key: k,
        label: getMonthLabel(k),
        count: monthInv.length,
        total: monthInv.reduce((s, i) => s + Number(i.amount || i.total || 0), 0),
      };
    });

    return { total, paid, collectionRate, overdueCount, overdueAmt, avgPaymentDays, trend };
  }, [invoices, monthKeys6]);

  const serviceStats = useMemo(() => {
    const counts: Record<string, { service: any; count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const sid = b.serviceId;
      if (!sid) return;
      if (!counts[sid]) counts[sid] = { service: b.service || services.find((s) => s.id === sid), count: 0, revenue: 0 };
      counts[sid].count += 1;
      counts[sid].revenue += Number(b.service?.price || 0);
    });
    const ranked = Object.values(counts)
      .filter((c) => c.service)
      .sort((a, b) => b.count - a.count);
    const activeCount = services.filter((s) => s.active !== false).length;
    const inactiveCount = services.filter((s) => s.active === false).length;
    const avgRevenue = ranked.length ? ranked.reduce((s, c) => s + c.revenue, 0) / ranked.length : 0;
    return { top5: ranked.slice(0, 5), avgRevenue, activeCount, inactiveCount };
  }, [bookings, services]);

  const prevCustomers30 = useMemo(() =>
    customers.filter((c) => {
      const d = new Date(c.createdAt);
      const now = new Date();
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60) && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    }).length, [customers]);

  const prevBookings30 = useMemo(() =>
    bookings.filter((b) => {
      const d = new Date(b.createdAt);
      const now = new Date();
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60) && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    }).length, [bookings]);

  const prevInvoices30 = useMemo(() =>
    invoices.filter((i) => {
      const d = new Date(i.createdAt);
      const now = new Date();
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60) && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    }).length, [invoices]);

  const prevRevenue30 = useMemo(() =>
    invoices.filter((i) => i.status === "PAID" && (() => {
      const d = new Date(i.paidDate || i.createdAt);
      const now = new Date();
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60) && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    })()).reduce((s, i) => s + Number(i.amount || i.total || 0), 0), [invoices]);

  const prevCompleted30 = useMemo(() =>
    bookings.filter((b) => b.status === "COMPLETED" && (() => {
      const d = new Date(b.date);
      const now = new Date();
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60) && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    })()).length, [bookings]);

  const prevCancelled30 = useMemo(() =>
    bookings.filter((b) => b.status === "CANCELLED" && (() => {
      const d = new Date(b.date);
      const now = new Date();
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60) && d < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    })()).length, [bookings]);

  /* ---------- Render guards ---------- */

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
        pageTitle="Raporlar"
        breadcrumbs={[{ label: "Raporlar" }]}
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

  const hasAnyData = bookings.length > 0 || customers.length > 0 || invoices.length > 0 || services.length > 0;

  /* =========================================== */
  return (
    <DashboardLayout
      pageTitle="Raporlar"
      breadcrumbs={[{ label: "Raporlar" }]}
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                active
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              )}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {error && !loading && (
        <div className="mb-6">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      )}

      {loading ? (
        <>
          <SkeletonCard count={4} className="mb-6" />
          <SkeletonTable columns={5} rows={5} />
        </>
      ) : !hasAnyData ? (
        <EmptyState
          icon={BarChart3}
          title="Henüz veri yok"
          description="Raporlar oluşturulabilmesi için randevu, müşteri, fatura veya hizmet kaydı ekleyin."
        />
      ) : (
        <div className="space-y-6">
          {/* ==================== TAB: REVENUE ==================== */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricTile label="Toplam Tahsilat (6 ay)" value={formatCurrency(totalRevenue)} icon={Banknote} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
                <MetricTile label="Ort. Aylık Gelir" value={formatCurrency(avgMonthlyRevenue)} icon={TrendingUp} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
                <MetricTile label="En Yüksek Ay" value={highestMonth ? highestMonth.label : "—"} sub={highestMonth ? formatCurrency(highestMonth.paid) : undefined} icon={Calendar} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
                <MetricTile label="Bekleyen Tahsilat" value={formatCurrency(unpaidTotal)} icon={Receipt} iconBg="bg-rose-500/10" iconColor="text-rose-400" />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Aylık Gelir (Son 6 Ay)</h3>
                <p className="text-xs text-slate-500 mb-5">Mavi: Toplam | Yeşil: Tahsil Edilen | Kırmızı: Bekleyen</p>
                {invoices.length === 0 ? (
                  <div className="py-12">
                    <EmptyState icon={Banknote} title="Henüz fatura kaydı yok" description="Fatura oluşturulduğunda grafik görünecek" />
                  </div>
                ) : (
                  <SimpleBarChart
                    data={revenueByMonth.map((m) => ({
                      label: m.label,
                      bars: [
                        { value: m.total, color: "bg-blue-500/60" },
                        { value: m.paid, color: "bg-emerald-500/60" },
                        { value: m.unpaid + m.overdue, color: "bg-rose-500/60" },
                      ],
                    }))}
                  />
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Ödeme Durumu Dağılımı</h3>
                <StackedBar
                  segments={[
                    { label: "Tahsil Edildi", value: paidTotal, color: "bg-emerald-500" },
                    { label: "Bekleyen", value: unpaidTotal - overdueTotal, color: "bg-amber-500" },
                    { label: "Gecikmiş", value: overdueTotal, color: "bg-rose-500" },
                  ]}
                  total={paidTotal + unpaidTotal}
                />
              </div>
            </div>
          )}

          {/* ==================== TAB: CUSTOMERS ==================== */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricTile label="Toplam Müşteri" value={totalCustomers.toLocaleString("tr-TR")} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
                <MetricTile label="Yeni Müşteri (30 gün)" value={newCustomers30.toLocaleString("tr-TR")} icon={UserPlus} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
                <MetricTile label="Aktif Müşteri (90 gün)" value={activeCustomers90.toLocaleString("tr-TR")} icon={CheckCircle2} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
                <MetricTile label="Pasif Müşteri" value={(totalCustomers - activeCustomers90).toLocaleString("tr-TR")} icon={Clock} iconBg="bg-slate-500/10" iconColor="text-slate-400" />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-200">En Çok Harcayan Müşteriler (Top 5)</h3>
                </div>
                {topCustomers.length === 0 ? (
                  <div className="p-8">
                    <EmptyState icon={Users} title="Henüz veri yok" description="Fatura kaydı oluşturulduğunda liste görünecek" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-medium">#</th>
                          <th className="px-5 py-3 font-medium">Müşteri</th>
                          <th className="px-5 py-3 font-medium">E-posta</th>
                          <th className="px-5 py-3 font-medium text-right">Toplam Harcama</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {topCustomers.map((tc, idx) => (
                          <tr key={tc.customer.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-5 py-3 text-slate-500 font-mono text-xs">{idx + 1}</td>
                            <td className="px-5 py-3 text-slate-200 font-medium">{tc.customer.name}</td>
                            <td className="px-5 py-3 text-slate-400 text-xs">{tc.customer.email || "—"}</td>
                            <td className="px-5 py-3 text-slate-100 font-medium text-right">{formatCurrency(tc.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB: BOOKINGS ==================== */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricTile label="Toplam Randevu" value={totalBookings.toLocaleString("tr-TR")} icon={Calendar} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
                <MetricTile label="Tamamlanan" value={completedBookings.toLocaleString("tr-TR")} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
                <MetricTile label="İptal" value={cancelledBookings.toLocaleString("tr-TR")} icon={XCircle} iconBg="bg-rose-500/10" iconColor="text-rose-400" />
                <MetricTile label="Bekleyen" value={pendingBookings.toLocaleString("tr-TR")} icon={Clock} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Haftalık Doluluk Oranı</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${weeklyOccupancy}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 w-12 text-right">{weeklyOccupancy}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">Bu haftaki randevular / haftalık kapasite (40 slot)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">En Çok Talep Edilen Gün</h3>
                  {popularDayHour.day ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-100">{popularDayHour.day[0]}</p>
                        <p className="text-xs text-slate-500">{popularDayHour.day[1]} randevu</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Henüz yeterli veri yok</p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">En Çok Talep Edilen Saat</h3>
                  {popularDayHour.hour ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Clock size={20} className="text-amber-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-100">{popularDayHour.hour[0]}</p>
                        <p className="text-xs text-slate-500">{popularDayHour.hour[1]} randevu</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Henüz yeterli veri yok</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Randevu Durum Dağılımı</h3>
                <StackedBar
                  segments={[
                    { label: "Tamamlandı", value: completedBookings, color: "bg-emerald-500" },
                    { label: "Bekleyen", value: pendingBookings, color: "bg-amber-500" },
                    { label: "İptal", value: cancelledBookings, color: "bg-rose-500" },
                  ]}
                  total={totalBookings}
                />
              </div>
            </div>
          )}

          {/* ==================== TAB: INVOICES ==================== */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricTile label="Tahsilat Oranı" value={`%${invoiceTotals.collectionRate.toFixed(1)}`} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
                <MetricTile label="Gecikmiş Fatura" value={invoiceTotals.overdueCount.toLocaleString("tr-TR")} sub={formatCurrency(invoiceTotals.overdueAmt)} icon={AlertCircle} iconBg="bg-rose-500/10" iconColor="text-rose-400" />
                <MetricTile label="Ort. Ödeme Süresi" value={`${invoiceTotals.avgPaymentDays} gün`} icon={Clock} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
                <MetricTile label="Toplam Fatura Tutarı" value={formatCurrency(invoiceTotals.total)} icon={Receipt} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Aylık Fatura Oluşturma Trendi</h3>
                <p className="text-xs text-slate-500 mb-5">Son 6 ay</p>
                {invoices.length === 0 ? (
                  <div className="py-12">
                    <EmptyState icon={Receipt} title="Henüz fatura yok" description="Fatura oluşturulduğunda trend görünecek" />
                  </div>
                ) : (
                  <SimpleBarChart
                    data={invoiceTotals.trend.map((t) => ({
                      label: t.label,
                      bars: [
                        { value: t.total, color: "bg-blue-500/60" },
                        { value: t.count * 1000, color: "bg-slate-500/40" },
                      ],
                    }))}
                  />
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">Tahsilat Detayı</h3>
                <div className="space-y-4">
                  <MiniBar value={invoiceTotals.paid} max={invoiceTotals.total} colorClass="bg-emerald-500" label="Tahsil Edilen" />
                  <MiniBar value={invoiceTotals.total - invoiceTotals.paid} max={invoiceTotals.total} colorClass="bg-rose-500" label="Bekleyen / Gecikmiş" />
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: SERVICES ==================== */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricTile label="Toplam Hizmet" value={services.length.toLocaleString("tr-TR")} icon={Wrench} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
                <MetricTile label="Aktif Hizmet" value={serviceStats.activeCount.toLocaleString("tr-TR")} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
                <MetricTile label="Pasif Hizmet" value={serviceStats.inactiveCount.toLocaleString("tr-TR")} icon={Package} iconBg="bg-slate-500/10" iconColor="text-slate-400" />
                <MetricTile label="Ort. Hizmet Geliri" value={formatCurrency(serviceStats.avgRevenue)} icon={Banknote} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-200">En Çok Satılan Hizmetler (Top 5)</h3>
                </div>
                {serviceStats.top5.length === 0 ? (
                  <div className="p-8">
                    <EmptyState icon={Wrench} title="Henüz veri yok" description="Randevu kaydı oluşturulduğunda liste görünecek" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                          <th className="px-5 py-3 font-medium">#</th>
                          <th className="px-5 py-3 font-medium">Hizmet</th>
                          <th className="px-5 py-3 font-medium">Randevu Sayısı</th>
                          <th className="px-5 py-3 font-medium text-right">Toplam Gelir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {serviceStats.top5.map((s, idx) => (
                          <tr key={s.service.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="px-5 py-3 text-slate-500 font-mono text-xs">{idx + 1}</td>
                            <td className="px-5 py-3 text-slate-200 font-medium">{s.service.name}</td>
                            <td className="px-5 py-3 text-slate-400">{s.count}</td>
                            <td className="px-5 py-3 text-slate-100 font-medium text-right">{formatCurrency(s.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB: OVERVIEW ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricTile label="Toplam Gelir (6 ay)" value={formatCurrency(totalRevenue)} icon={Banknote} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
                <MetricTile label="Toplam Müşteri" value={totalCustomers.toLocaleString("tr-TR")} icon={Users} iconBg="bg-emerald-500/10" iconColor="text-emerald-400" />
                <MetricTile label="Toplam Randevu" value={totalBookings.toLocaleString("tr-TR")} icon={Calendar} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
                <MetricTile label="Bekleyen Fatura" value={invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").length.toLocaleString("tr-TR")} icon={Receipt} iconBg="bg-rose-500/10" iconColor="text-rose-400" />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-sm font-semibold text-slate-200 mb-5">Son 30 Gün Özeti</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <OverviewStat label="Yeni Müşteri" current={newCustomers30} previous={prevCustomers30} />
                  <OverviewStat label="Yeni Randevu" current={bookings.filter((b) => isWithinDays(b.createdAt, 30)).length} previous={prevBookings30} />
                  <OverviewStat label="Yeni Fatura" current={invoices.filter((i) => isWithinDays(i.createdAt, 30)).length} previous={prevInvoices30} />
                  <OverviewStat label="Tahsilat" current={invoices.filter((i) => i.status === "PAID" && isWithinDays(i.paidDate || i.createdAt, 30)).reduce((s, i) => s + Number(i.amount || i.total || 0), 0)} previous={prevRevenue30} isCurrency />
                  <OverviewStat label="Tamamlanan Randevu" current={bookings.filter((b) => b.status === "COMPLETED" && isWithinDays(b.date, 30)).length} previous={prevCompleted30} />
                  <OverviewStat label="İptal Randevu" current={bookings.filter((b) => b.status === "CANCELLED" && isWithinDays(b.date, 30)).length} previous={prevCancelled30} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

/* ---------- Sub-components used inside tabs ---------- */

function OverviewStat({
  label,
  current,
  previous,
  isCurrency,
}: {
  label: string;
  current: number;
  previous: number;
  isCurrency?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-lg font-semibold text-slate-100">
          {isCurrency ? formatCurrency(current) : current.toLocaleString("tr-TR")}
        </p>
        <ChangeBadge current={current} previous={previous} />
      </div>
      <p className="text-[10px] text-slate-600 mt-1">
        Önceki 30 gün: {isCurrency ? formatCurrency(previous) : previous.toLocaleString("tr-TR")}
      </p>
    </div>
  );
}
