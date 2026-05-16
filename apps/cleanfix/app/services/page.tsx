"use client";

import { useEffect, useState, useCallback } from "react";
import { getServices } from "@/app/actions/services";
import { ServiceList } from "@/app/components/services/ServiceList";
import { SkeletonTable } from "@/app/components/ui/SkeletonTable";
import { ErrorState } from "@/app/components/ui/ErrorState";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
  createdAt: Date;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getServices();
    if (result.success) {
      setServices((result.data || []).map((s: any) => ({ ...s, price: Number(s.price) })));
      setError(null);
    } else {
      setError(result.error || "Bilinmeyen hata");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <DashboardLayout pageTitle="Hizmetler">
      {loading ? (
        <SkeletonTable columns={6} rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchServices} />
      ) : (
        <ServiceList services={services} onRefresh={fetchServices} />
      )}
    </DashboardLayout>
  );
}
