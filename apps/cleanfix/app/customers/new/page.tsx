"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { CustomerForm, CustomerFormData } from "@/app/components/customers/CustomerForm";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { createCustomer } from "@/app/actions/customers";
import { ArrowLeft } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  async function handleSubmit(data: CustomerFormData) {
    const result = await createCustomer(data);
    if (result.success) {
      addToast("Müşteri oluşturuldu", "success");
      setTimeout(() => router.push("/customers"), 1200);
    } else {
      addToast(result.error || "Müşteri oluşturulurken hata oluştu", "error");
    }
  }

  return (
    <DashboardLayout
      pageTitle="Yeni Müşteri"
      breadcrumbs={[
        { label: "Müşteriler", href: "/customers" },
        { label: "Yeni" },
      ]}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/customers"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-semibold text-slate-200">Yeni Müşteri Oluştur</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <CustomerForm onSubmit={handleSubmit} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/customers"
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
