"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { ServiceForm, ServiceFormData } from "@/app/components/services/ServiceForm";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { createService } from "@/app/actions/services";
import { ArrowLeft } from "lucide-react";

export default function NewServicePage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  async function handleSubmit(data: ServiceFormData) {
    const result = await createService(data);
    if (result.success) {
      addToast("Hizmet oluşturuldu", "success");
      setTimeout(() => router.push("/services"), 1200);
    } else {
      addToast(result.error || "Hizmet oluşturulurken hata oluştu", "error");
    }
  }

  return (
    <DashboardLayout
      pageTitle="Yeni Hizmet"
      breadcrumbs={[
        { label: "Hizmetler", href: "/services" },
        { label: "Yeni" },
      ]}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/services"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-semibold text-slate-200">Yeni Hizmet Oluştur</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <ServiceForm onSubmit={handleSubmit} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/services"
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
