"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getInvoices } from "@/app/actions/invoices";
import { getCustomers } from "@/app/actions/customers";
import { getDemoUser, hasRole } from "@/lib/auth";
import { InvoiceList } from "@/app/components/invoices/InvoiceList";
import { SkeletonTable } from "@/app/components/ui/SkeletonTable";
import { ErrorState } from "@/app/components/ui/ErrorState";
import { EmptyState } from "@/app/components/ui/EmptyState";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FileText, Shield } from "lucide-react";

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
  items: { id: string; service: string; quantity: number; unitPrice: number; total: number }[];
}

interface DemoUser {
  name: string;
  email: string;
  role: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [invRes, custRes] = await Promise.all([
        getInvoices(),
        getCustomers(),
      ]);

      if (invRes.success) {
        setInvoices(invRes.data || []);
      } else {
        setError(invRes.error || "Faturalar yüklenirken hata oluştu");
      }

      if (custRes.success) {
        setCustomers(custRes.data?.map((c: any) => ({ id: c.id, name: c.name })) || []);
      }
    } catch (err) {
      setError("Sayfa yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const u = await getDemoUser();
        if (!u) {
          router.push("/login");
          return;
        }
        setUser(u);

        const auth = await hasRole(["ADMIN", "MANAGER"]);
        setAuthorized(auth);

        if (auth) {
          await fetchData();
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError("Sayfa yüklenirken bir hata oluştu");
        setLoading(false);
      }
    }
    init();
  }, [fetchData, router]);

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
        pageTitle="Faturalar"
        breadcrumbs={[{ label: "Faturalar" }]}
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

  return (
    <DashboardLayout
      pageTitle="Faturalar"
      breadcrumbs={[{ label: "Faturalar" }]}
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {loading ? (
        <SkeletonTable columns={7} rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : invoices.length === 0 && customers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Henüz fatura yok"
          description="İlk fatura eklemek için yukarıdaki butonu kullanın"
          actionLabel="Yeni Fatura Ekle"
          onAction={() => { window.location.href = "/invoices/new"; }}
        />
      ) : (
        <InvoiceList
          invoices={invoices}
          customers={customers}
          onRefresh={fetchData}
        />
      )}
    </DashboardLayout>
  );
}
