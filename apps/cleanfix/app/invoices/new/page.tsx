"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { InvoiceForm, InvoiceFormData } from "@/app/components/invoices/InvoiceForm";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { getCustomers } from "@/app/actions/customers";
import { createInvoice } from "@/app/actions/invoices";
import { ArrowLeft } from "lucide-react";

interface DropdownItem {
  id: string;
  name: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [customers, setCustomers] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await getCustomers();
      if (res.success) {
        setCustomers((res.data || []).map((c: any) => ({ id: c.id, name: c.name })));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleSubmit(data: InvoiceFormData) {
    const total = data.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
    const result = await createInvoice({ ...data, total });
    if (result.success) {
      addToast("Fatura oluşturuldu", "success");
      setTimeout(() => router.push("/invoices"), 1200);
    } else {
      addToast(result.error || "Fatura oluşturulurken hata oluştu", "error");
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Yeni Fatura"
        breadcrumbs={[
          { label: "Faturalar", href: "/invoices" },
          { label: "Yeni" },
        ]}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-10 bg-slate-800 rounded-lg w-1/3 animate-pulse" />
          <div className="h-96 bg-slate-800 rounded-xl border border-slate-800 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Yeni Fatura"
      breadcrumbs={[
        { label: "Faturalar", href: "/invoices" },
        { label: "Yeni" },
      ]}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/invoices"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-semibold text-slate-200">Yeni Fatura Oluştur</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <InvoiceForm customers={customers} onSubmit={handleSubmit} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/invoices"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              İptal
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
