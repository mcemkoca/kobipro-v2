"use client";

import { useState, useMemo } from "react";
import { InvoiceForm, InvoiceFormData } from "./InvoiceForm";
import { InvoiceModal } from "./InvoiceModal";
import { createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoices";
import { Button } from "@kobipro/ui";
import { cn } from "@kobipro/ui";
import { Search, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface InvoiceItem {
  id: string;
  service: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  customerId: string;
  number: string;
  date: Date;
  dueDate: Date;
  status: string;
  notes: string | null;
  total: number;
  createdAt: Date;
  customer: { id: string; name: string } | null;
  items: InvoiceItem[];
}

interface InvoiceListProps {
  invoices: Invoice[];
  customers: { id: string; name: string }[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  SENT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  OVERDUE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  INACTIVE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const statusLabels: Record<string, string> = {
  PAID: "Ödendi",
  SENT: "Ödenmedi",
  OVERDUE: "Gecikti",
  DRAFT: "Taslak",
};

export function InvoiceList({ invoices, customers, onRefresh }: InvoiceListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        searchQuery === "" ||
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Bu faturayı silmek istediğinize emin misiniz?")) return;
    setLoading(id);
    const result = await deleteInvoice(id);
    setLoading(null);
    if (result.success) {
      onRefresh();
    } else {
      alert(result.error);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setLoading(id);
    const result = await updateInvoiceStatus(id, newStatus);
    setLoading(null);
    if (result.success) {
      onRefresh();
    } else {
      alert(result.error);
    }
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
              placeholder="Fatura ara..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm",
              "bg-slate-900 border border-slate-800 text-slate-200",
              "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            )}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="PAID">Ödendi</option>
            <option value="SENT">Ödenmedi</option>
            <option value="OVERDUE">Gecikti</option>
            <option value="DRAFT">Taslak</option>
          </select>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Yeni Fatura</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Fatura No</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Müşteri</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Tarih</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Son Ödeme</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Durum</th>
              <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">Tutar</th>
              <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className="text-slate-600" />
                    <p>Henüz fatura oluşturulmadı.</p>
                    <p className="text-xs text-slate-600">Yeni bir fatura eklemek için yukarıdaki butonu kullanın.</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredInvoices.map((invoice) => (
              <>
                <tr key={invoice.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">{invoice.number}</td>
                  <td className="px-5 py-3 font-medium text-slate-200">{invoice.customer?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {new Date(invoice.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">
                    {new Date(invoice.dueDate).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      disabled={loading === invoice.id}
                      className={`text-xs px-2 py-1 rounded-md border-0 font-medium cursor-pointer ${statusColors[invoice.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-200 font-medium">
                    ₺{invoice.total.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setExpandedInvoice(expandedInvoice === invoice.id ? null : invoice.id)}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {expandedInvoice === invoice.id ? "Kapat" : "Detay"}
                      </button>
                      <button
                        onClick={() => setEditingInvoice(invoice)}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        disabled={loading === invoice.id}
                        className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedInvoice === invoice.id && (
                  <tr>
                    <td colSpan={7} className="px-5 py-3 bg-slate-800/30">
                      <div className="text-sm space-y-2">
                        {invoice.notes && (
                          <p className="text-slate-400">
                            <span className="font-medium text-slate-300">Notlar:</span> {invoice.notes}
                          </p>
                        )}
                        {invoice.items && invoice.items.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-slate-300 text-xs mb-1">Kalemler:</p>
                            <div className="space-y-1">
                              {invoice.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-slate-400">
                                  <span>{item.service} × {item.quantity}</span>
                                  <span>₺{item.total.toLocaleString("tr-TR")}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-slate-500 text-xs">
                          Oluşturulma: {new Date(invoice.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <InvoiceModal title="Yeni Fatura" onClose={() => setIsCreateModalOpen(false)}>
          <InvoiceForm
            customers={customers}
            onSubmit={async (data) => {
              const total = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
              const result = await createInvoice({ ...data, total });
              if (result.success) {
                setIsCreateModalOpen(false);
                onRefresh();
              } else {
                alert(result.error);
              }
            }}
          />
        </InvoiceModal>
      )}

      {editingInvoice && (
        <InvoiceModal title="Faturayı Düzenle" onClose={() => setEditingInvoice(null)}>
          <InvoiceForm
            initialData={{
              customerId: editingInvoice.customerId,
              number: editingInvoice.number,
              date: new Date(editingInvoice.date).toISOString().split("T")[0],
              dueDate: new Date(editingInvoice.dueDate).toISOString().split("T")[0],
              status: editingInvoice.status,
              notes: editingInvoice.notes,
              items: editingInvoice.items.map((item) => ({
                service: item.service,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            }}
            customers={customers}
            onSubmit={async (data) => {
              const total = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
              const result = await updateInvoice(editingInvoice.id, { ...data, total });
              if (result.success) {
                setEditingInvoice(null);
                onRefresh();
              } else {
                alert(result.error);
              }
            }}
          />
        </InvoiceModal>
      )}
    </div>
  );
}
