"use client";

import { useEffect, useState, useCallback } from "react";
import { getCustomers } from "@/app/actions/customers";
import { CustomerList } from "@/app/components/customers/CustomerList";
import { SkeletonTable } from "@/app/components/ui/SkeletonTable";
import { ErrorState } from "@/app/components/ui/ErrorState";
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
    setError(null);
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
        <SkeletonTable columns={5} rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCustomers} />
      ) : (
        <CustomerList customers={customers} onRefresh={fetchCustomers} />
      )}
    </DashboardLayout>
  );
}
