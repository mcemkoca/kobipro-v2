"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import {
  Building2,
  MapPin,
  Flame,
  Landmark,
  Plane,
  ShoppingBag,
  UtensilsCrossed,
  School,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Phone,
  Mail,
  ArrowUpDown,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@kobipro/ui";
import type { AfyonCustomer, AfyonInvoice, AfyonStats } from "@/app/actions/afyon";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface Props {
  customers: AfyonCustomer[];
  invoices: AfyonInvoice[];
  stats: AfyonStats;
}

type TypeFilter = "ALL" | "OTEL" | "TERMAL" | "TURIZM" | "RESTORAN" | "KAMU" | "AVM" | "HAVAALANI" | "TARIHI";
type StatusFilter = "ALL" | "AKTIF" | "ARALIKLI" | "YENI" | "PASIF";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const TYPE_CONFIG: Record<string, { label: string; icon: typeof Building2; color: string; bg: string; border: string }> = {
  OTEL:       { label: "Otel",        icon: Building2,       color: "text-blue-400",       bg: "bg-blue-500/10",       border: "border-blue-500/20" },
  TERMAL:     { label: "Termal",      icon: Flame,           color: "text-emerald-400",   bg: "bg-emerald-500/10",   border: "border-emerald-500/20" },
  TURIZM:     { label: "Turizm",      icon: MapPin,          color: "text-amber-400",     bg: "bg-amber-500/10",     border: "border-amber-500/20" },
  RESTORAN:   { label: "Restoran",    icon: UtensilsCrossed, color: "text-rose-400",      bg: "bg-rose-500/10",      border: "border-rose-500/20" },
  KAMU:       { label: "Kamu",        icon: Landmark,        color: "text-indigo-400",    bg: "bg-indigo-500/10",    border: "border-indigo-500/20" },
  AVM:        { label: "AVM",         icon: ShoppingBag,     color: "text-fuchsia-400",   bg: "bg-fuchsia-500/10",   border: "border-fuchsia-500/20" },
  HAVAALANI:  { label: "Havalimanı",  icon: Plane,           color: "text-sky-400",       bg: "bg-sky-500/10",       border: "border-sky-500/20" },
  TARIHI:     { label: "Tarihi Eser", icon: Landmark,        color: "text-yellow-400",    bg: "bg-yellow-500/10",    border: "border-yellow-500/20" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  AKTIF:    { label: "Aktif",    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ARALIKLI: { label: "Aralıklı", color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  YENI:     { label: "Yeni",     color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  PASIF:    { label: "Pasif",    color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20" },
};

const INV_STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  PAID:    { label: "Ödendi",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
  PENDING: { label: "Bekliyor", color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: Clock },
  OVERDUE: { label: "Gecikmiş", color: "text-rose-400",    bg: "bg-rose-500/10",   border: "border-rose-500/20",   icon: AlertTriangle },
};

function formatTL(n: number) {
  return `₺${n.toLocaleString("tr-TR")}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function daysSince(date: string) {
  const diff = Math.floor((Date.now() - new Date(date + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client Component                                                    */
/* ------------------------------------------------------------------ */
export default function AfyonClient({ customers, invoices, stats }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"revenue" | "rating" | "lastService">("revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<AfyonCustomer | null>(null);

  /* filters + sort */
  const filtered = useMemo(() => {
    let list = customers.filter((c) => {
      const matchesType = typeFilter === "ALL" || c.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q);
      return matchesType && matchesStatus && matchesSearch;
    });
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "revenue") return (a.revenueYTD - b.revenueYTD) * dir;
      if (sortKey === "rating") return (a.rating - b.rating) * dir;
      return (new Date(a.lastService).getTime() - new Date(b.lastService).getTime()) * dir;
    });
    return list;
  }, [customers, typeFilter, statusFilter, search, sortKey, sortDir]);

  /* derived invoice list for selected customer */
  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return invoices.filter((i) => i.customerId === selectedCustomer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, invoices]);

  /* district breakdown for chart */
  const districtData = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    customers.forEach((c) => {
      if (!map[c.district]) map[c.district] = { count: 0, revenue: 0 };
      map[c.district].count++;
      map[c.district].revenue += c.revenueYTD;
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [customers]);

  /* type breakdown */
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    customers.forEach((c) => {
      map[c.type] = (map[c.type] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [customers]);

  return (
    <DashboardLayout pageTitle="Afyonkarahisar Bölgesi" user={{ name: "Admin", email: "admin@cleanfix.pro", role: "ADMIN" }}>

      {/* Hero / Region Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <MapPin size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Afyonkarahisar</h2>
                <p className="text-sm text-slate-400">Pilot Bölge · 12 Aktif Müşteri · 5 İlçe</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-lg">
              Termal turizm, tarihi miras ve tarım merkezi Afyon&apos;da CleanFix aktif hizmet veriyor.
              İkbal Thermal, Zafer Havalimanı, Frig Vadisi ve daha fazlası.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
              ₺ / €
            </div>
            <Link href="/invoices" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center gap-2">
              <FileText size={14} /> Faturalar
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Toplam Müşteri</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10"><Users size={20} className="text-blue-400" /></div>
          </div>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp size={12} /> {stats.activeCustomers} aktif</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">YTD Gelir</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{formatTL(stats.ytdRevenue)}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10"><Wallet size={20} className="text-emerald-400" /></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Aylık ortalama: {formatTL(stats.monthlyRevenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bekleyen Fatura</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pendingInvoices}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock size={20} className="text-amber-400" /></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Tahsilat bekleniyor</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gecikmiş</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{stats.overdueInvoices}</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10"><AlertTriangle size={20} className="text-rose-400" /></div>
          </div>
          <p className="text-xs text-rose-400/70 mt-2 flex items-center gap-1"><TrendingDown size={12} /> Tahsilat gerekli</p>
        </div>
      </div>

      {/* Districts + Types mini chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><MapPin size={16} className="text-amber-400" /> İlçe Dağılımı</h3>
          <div className="space-y-3">
            {districtData.map(([district, data]) => {
              const maxRev = districtData[0][1].revenue;
              const pct = (data.revenue / maxRev) * 100;
              return (
                <div key={district} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-slate-400 shrink-0">{district}</span>
                  <div className="flex-1 h-6 bg-slate-800 rounded-md overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-400 rounded-md transition-all" style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-white mix-blend-difference">{data.count} müşteri · {formatTL(data.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><Building2 size={16} className="text-blue-400" /> Sektörler</h3>
          <div className="space-y-2">
            {typeData.map(([type, count]) => {
              const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.OTEL;
              const Icon = cfg.icon;
              const maxCount = typeData[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={cfg.color} />
                    <span className="text-xs text-slate-300">{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", cfg.bg.replace("/10", ""))} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {(["ALL", "OTEL", "TERMAL", "KAMU", "AVM", "TURIZM", "RESTORAN", "HAVAALANI", "TARIHI"] as TypeFilter[]).map((t) => {
            const cfg = t === "ALL" ? null : TYPE_CONFIG[t];
            const count = t === "ALL" ? customers.length : customers.filter((c) => c.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5",
                  typeFilter === t
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                )}
              >
                {cfg && <cfg.icon size={12} />}
                {t === "ALL" ? "Tümü" : cfg?.label}
                <span className={cn("ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold", typeFilter === t ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500")}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Müşteri, ilçe, adres ara..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-slate-600"
            />
          </div>
          <button onClick={() => { setSortKey("revenue"); setSortDir((d) => (d === "desc" ? "asc" : "desc")); }} className={cn("p-2 rounded-lg border text-xs font-medium transition-all", sortKey === "revenue" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700")} title="Gelire göre sırala">
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const cfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.OTEL;
          const Icon = cfg.icon;
          const scfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.AKTIF;
          const days = daysSince(c.lastService);
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCustomer(c)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 cursor-pointer hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", cfg.bg, cfg.border, "border")}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{c.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1"><MapPin size={10} />{c.district}</p>
                  </div>
                </div>
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border", scfg.bg, scfg.color, scfg.border)}>{scfg.label}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{c.address}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {c.services.slice(0, 3).map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">{s}</span>
                ))}
                {c.services.length > 3 && <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">+{c.services.length - 3}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-500">YTD Gelir</p>
                  <p className="text-sm font-bold text-slate-200">{formatTL(c.revenueYTD)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Son hizmet</p>
                  <p className={cn("text-xs font-medium", days <= 3 ? "text-emerald-400" : days <= 7 ? "text-amber-400" : "text-slate-400")}>
                    {days === 0 ? "Bugün" : `${days} gün önce`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                {renderStars(c.rating)}
                <ChevronDown size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", TYPE_CONFIG[selectedCustomer.type]?.bg, TYPE_CONFIG[selectedCustomer.type]?.border, "border")}>
                  {(TYPE_CONFIG[selectedCustomer.type]?.icon || Building2)({ size: 18, className: TYPE_CONFIG[selectedCustomer.type]?.color })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.address}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">İletişim</p>
                  <p className="text-sm text-slate-200 flex items-center gap-1.5"><Phone size={12} className="text-emerald-400" />{selectedCustomer.phone}</p>
                  <p className="text-sm text-slate-200 flex items-center gap-1.5 mt-1"><Mail size={12} className="text-blue-400" />{selectedCustomer.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Yetkili</p>
                  <p className="text-sm text-slate-200">{selectedCustomer.contact}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedCustomer.district} · {STATUS_CONFIG[selectedCustomer.status]?.label}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">YTD Gelir</p>
                  <p className="text-lg font-bold text-slate-100">{formatTL(selectedCustomer.revenueYTD)}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Değerlendirme</p>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedCustomer.rating)}
                    <span className="text-sm text-slate-200 font-medium">{selectedCustomer.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Hizmetler</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.services.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">{s}</span>
                  ))}
                </div>
              </div>

              {selectedCustomer.notes && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-xs text-amber-400/80 flex items-center gap-1.5"><AlertTriangle size={12} /> Not</p>
                  <p className="text-sm text-slate-300 mt-1">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Invoice History */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={12} /> Fatura Geçmişi · {customerInvoices.length} kayıt
                </p>
                <div className="space-y-2">
                  {customerInvoices.map((inv) => {
                    const ic = INV_STATUS[inv.status] || INV_STATUS.PENDING;
                    const Ic = ic.icon;
                    return (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border", ic.bg, ic.color, ic.border)}>
                            <Ic size={10} />{ic.label}
                          </span>
                          <div>
                            <p className="text-sm text-slate-200">{inv.service}</p>
                            <p className="text-[11px] text-slate-500">{inv.invoiceNumber} · {formatDate(inv.date)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-200">{formatTL(inv.amount)}</p>
                      </div>
                    );
                  })}
                  {customerInvoices.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">Henüz fatura kaydı yok.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
