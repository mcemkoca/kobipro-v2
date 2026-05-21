"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit3,
  XCircle,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { cn } from "@kobipro/ui";
import { updateInvoiceStatus } from "@/app/actions/invoices";
import type { Invoice } from "@/app/actions/invoices";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */
interface Props {
  invoices: Invoice[];
}

type StatusFilter = "ALL" | "PAID" | "PENDING" | "OVERDUE" | "DRAFT" | "CANCELLED";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }> = {
  PAID:      { label: "Ödendi",      bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: CheckCircle2 },
  PENDING:   { label: "Bekliyor",    bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20",  icon: Clock },
  OVERDUE:   { label: "Gecikmiş",    bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/20",   icon: AlertTriangle },
  DRAFT:     { label: "Taslak",      bg: "bg-slate-500/10",  text: "text-slate-400",  border: "border-slate-500/20",  icon: Edit3 },
  CANCELLED: { label: "İptal",       bg: "bg-zinc-500/10",   text: "text-zinc-400",   border: "border-zinc-500/20",   icon: XCircle },
};

function formatCurrency(n: number) {
  return `€${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(due: string) {
  const diff = Math.ceil((new Date(due + "T00:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ------------------------------------------------------------------ */
/*  Client Component                                                    */
/* ------------------------------------------------------------------ */
export default function InvoicesClient({ invoices: initialInvoices }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "total" | "dueDate">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [actionRow, setActionRow] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* derived stats */
  const stats = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.total, 0);
    const paid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0);
    const pending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + i.total, 0);
    const overdue = invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.total, 0);
    return { total, paid, pending, overdue, count: invoices.length };
  }, [invoices]);

  /* filtered + sorted */
  const displayed = useMemo(() => {
    let list = invoices.filter((i) => {
      const matchesFilter = filter === "ALL" || i.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customer.toLowerCase().includes(q) ||
        i.service.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "total") return (a.total - b.total) * dir;
      if (sortKey === "dueDate") return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    });
    return list;
  }, [invoices, filter, search, sortKey, sortDir]);

  /* handlers */
  function showToast(type: "ok" | "err", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await updateInvoiceStatus(id, newStatus);
    if (res.success) {
      setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus as Invoice["status"] } : i)));
      showToast("ok", `Fatura durumu güncellendi: ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } else {
      showToast("err", res.error || "Güncelleme başarısız.");
    }
    setActionRow(null);
  }

  function handleDownload(inv: Invoice) {
    showToast("ok", `PDF indiriliyor: ${inv.invoiceNumber}...`);
    setTimeout(() => showToast("ok", `${inv.invoiceNumber}.pdf indirildi.`), 1200);
  }

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "ALL", label: "Tümü", count: invoices.length },
    { key: "PAID", label: "Ödenen", count: invoices.filter((i) => i.status === "PAID").length },
    { key: "PENDING", label: "Bekleyen", count: invoices.filter((i) => i.status === "PENDING").length },
    { key: "OVERDUE", label: "Gecikmiş", count: invoices.filter((i) => i.status === "OVERDUE").length },
    { key: "DRAFT", label: "Taslak", count: invoices.filter((i) => i.status === "DRAFT").length },
    { key: "CANCELLED", label: "İptal", count: invoices.filter((i) => i.status === "CANCELLED").length },
  ];

  return (
    <DashboardLayout pageTitle="Faturalar" user={{ name: "Admin", email: "admin@cleanfix.pro", role: "ADMIN" }}>
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border text-sm font-medium shadow-lg flex items-center gap-2 transition-all",
          toast.type === "ok" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          {toast.type === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.text}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Toplam Faturalar</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{stats.count}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10"><FileText size={20} className="text-blue-400" /></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">{formatCurrency(stats.total)} toplam değer</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ödenen</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(stats.paid)}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle2 size={20} className="text-emerald-400" /></div>
          </div>
          <p className="text-xs text-emerald-500/70 mt-2 flex items-center gap-1"><TrendingUp size={12} /> %{Math.round((stats.paid / (stats.total || 1)) * 100)} tahsilat oranı</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bekleyen</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(stats.pending)}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock size={20} className="text-amber-400" /></div>
          </div>
          <p className="text-xs text-amber-500/70 mt-2">{invoices.filter((i) => i.status === "PENDING").length} açık fatura</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gecikmiş</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(stats.overdue)}</p>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10"><AlertTriangle size={20} className="text-rose-400" /></div>
          </div>
          <p className="text-xs text-rose-500/70 mt-2 flex items-center gap-1"><TrendingDown size={12} /> Tahsilat gerekli</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
                filter === f.key
                  ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              )}
            >
              {f.label}
              <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold", filter === f.key ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500")}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Fatura, müşteri, hizmet ara..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={() => { setSortKey("date"); setSortDir((d) => (d === "desc" ? "asc" : "desc")); }}
            className={cn("p-2 rounded-lg border text-xs font-medium transition-all", sortKey === "date" ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700")}
            title="Tarihe göre sırala"
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fatura No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Müşteri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hizmet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortKey("date"); setSortDir((d) => (d === "desc" ? "asc" : "desc")); }}>
                  <span className="flex items-center gap-1">Tarih <ArrowUpDown size={10} className={sortKey === "date" ? "text-blue-400" : "text-slate-600"} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortKey("dueDate"); setSortDir((d) => (d === "desc" ? "asc" : "desc")); }}>
                  <span className="flex items-center gap-1">Vade <ArrowUpDown size={10} className={sortKey === "dueDate" ? "text-blue-400" : "text-slate-600"} /></span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortKey("total"); setSortDir((d) => (d === "desc" ? "asc" : "desc")); }}>
                  <span className="flex items-center justify-end gap-1">Tutar <ArrowUpDown size={10} className={sortKey === "total" ? "text-blue-400" : "text-slate-600"} /></span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayed.map((inv) => {
                const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.DRAFT;
                const overdueDays = inv.status === "OVERDUE" || inv.status === "PENDING" ? daysUntil(inv.dueDate) : null;
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-slate-200 font-medium">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-slate-200 font-medium">{inv.customer}</p>
                        <p className="text-xs text-slate-500">{inv.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{inv.service}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-slate-400", overdueDays !== null && overdueDays < 0 ? "text-rose-400 font-medium" : "")}>{formatDate(inv.dueDate)}</span>
                        {overdueDays !== null && overdueDays < 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">{Math.abs(overdueDays)} gün gecikme</span>
                        )}
                        {overdueDays !== null && overdueDays >= 0 && overdueDays <= 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{overdueDays} gün kaldı</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <p className="text-slate-200 font-medium">{formatCurrency(inv.total)}</p>
                      <p className="text-[11px] text-slate-500">KDV: {formatCurrency(inv.tax)}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border", cfg.bg, cfg.text, cfg.border)}>
                        <cfg.icon size={12} />
                        {cfg.label}
                      </span>
                      {inv.paymentMethod && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{inv.paymentMethod} · {inv.paidDate ? formatDate(inv.paidDate) : ""}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDownload(inv)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="PDF İndir">
                          <Download size={14} />
                        </button>
                        <div className="relative">
                          <button onClick={() => setActionRow(actionRow === inv.id ? null : inv.id)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                          {actionRow === inv.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActionRow(null)} />
                              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden py-1">
                                {inv.status !== "PAID" && (
                                  <button onClick={() => handleStatusChange(inv.id, "PAID")} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                                    <CheckCircle2 size={12} className="text-emerald-400" /> Ödenmiş İşaretle
                                  </button>
                                )}
                                {inv.status !== "PENDING" && (
                                  <button onClick={() => handleStatusChange(inv.id, "PENDING")} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                                    <Clock size={12} className="text-amber-400" /> Bekliyor İşaretle
                                  </button>
                                )}
                                {inv.status !== "OVERDUE" && (
                                  <button onClick={() => handleStatusChange(inv.id, "OVERDUE")} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                                    <AlertTriangle size={12} className="text-rose-400" /> Gecikmiş İşaretle
                                  </button>
                                )}
                                {inv.status !== "DRAFT" && (
                                  <button onClick={() => handleStatusChange(inv.id, "DRAFT")} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors">
                                    <Edit3 size={12} className="text-slate-400" /> Taslak İşaretle
                                  </button>
                                )}
                                <div className="border-t border-slate-800 my-1" />
                                <button onClick={() => handleStatusChange(inv.id, "CANCELLED")} className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors">
                                  <XCircle size={12} /> İptal Et
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayed.length === 0 && (
          <div className="p-12 text-center">
            <FileText size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">Fatura bulunamadı</p>
            <p className="text-xs text-slate-500 mt-1">Arama kriterlerinizi değiştirin veya yeni fatura oluşturun.</p>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{displayed.length} fatura gösteriliyor</span>
          <span>Toplam: {formatCurrency(displayed.reduce((s, i) => s + i.total, 0))}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
