"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
import { BookingForm, BookingFormData } from "@/app/components/bookings/BookingForm";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { getCustomers } from "@/app/actions/customers";
import { getServices } from "@/app/actions/services";
import { getStaff } from "@/app/actions/staff";
import { createBooking } from "@/app/actions/bookings";
import { ArrowLeft } from "lucide-react";

interface DropdownItem {
  id: string;
  name: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [customers, setCustomers] = useState<DropdownItem[]>([]);
  const [services, setServices] = useState<DropdownItem[]>([]);
  const [staff, setStaff] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [cRes, sRes, stRes] = await Promise.all([
        getCustomers(),
        getServices(),
        getStaff(),
      ]);
      if (cRes.success) setCustomers((cRes.data || []).map((c: any) => ({ id: c.id, name: c.name })));
      if (sRes.success) setServices((sRes.data || []).map((s: any) => ({ id: s.id, name: s.name })));
      if (stRes.success) setStaff((stRes.data || []).map((s: any) => ({ id: s.id, name: s.name })));
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleSubmit(data: BookingFormData) {
    const result = await createBooking(data);
    if (result.success) {
      addToast("Randevu oluşturuldu", "success");
      setTimeout(() => router.push("/bookings"), 1200);
    } else {
      addToast(result.error || "Randevu oluşturulurken hata oluştu", "error");
    }
  }

  if (loading) {
    return (
      <DashboardLayout
        pageTitle="Yeni Randevu"
        breadcrumbs={[
          { label: "Randevular", href: "/bookings" },
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
      pageTitle="Yeni Randevu"
      breadcrumbs={[
        { label: "Randevular", href: "/bookings" },
        { label: "Yeni" },
      ]}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/bookings"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h2 className="text-lg font-semibold text-slate-200">Yeni Randevu Oluştur</h2>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <BookingForm
            customers={customers}
            services={services}
            staff={staff}
            onSubmit={handleSubmit}
          />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Link
              href="/bookings"
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
