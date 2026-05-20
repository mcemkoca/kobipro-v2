"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { StaffForm, StaffFormData } from "@/app/components/staff/StaffForm";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { createStaff } from "@/app/actions/staff";
import { ArrowLeft } from "lucide-react";

export default function NewStaffPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  async function handleSubmit(data: StaffFormData) {
    const result = await createStaff(data);
    if (result.success) {
      addToast("Personel oluşturuldu", "success");
      setTimeout(() => router.push("/staff"), 1200);
    } else {
      addToast(result.error || "Personel oluşturulurken hata oluştu", "error");
    }
  }

  return (
    <DashboardLayout
      pageTitle="Yeni Personel"
      breadcrumbs={[
        { label: "Personel", href: "/staff" },
        { label: "Yeni" },
      ]}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/staff"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h2 className="text-lg font-semibold text-slate-200">Yeni Personel Oluştur</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <StaffForm onSubmit={handleSubmit} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/staff"
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
