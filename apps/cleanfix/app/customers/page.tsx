"use client";

import { useEffect, useState, useCallback } from "react";
import { getCustomers } from "@/app/actions/customers";
import { CustomerList } from "@/app/components/customers/CustomerList";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const result = await getCustomers();
    if (result.success) {
      setCustomers(result.data || []);
      setError(null);
    } else {
      setError(result.error || "Bilinmeyen hata");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <DashboardLayout pageTitle="Müşteriler">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-100" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {error}
        </div>
      ) : (
        <CustomerList customers={customers} onRefresh={fetchCustomers} />
      )}
    </DashboardLayout>
  );
}
