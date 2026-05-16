"use client";

import { useEffect, useState, useCallback } from "react";
import { getServices } from "@/app/actions/services";
import { ServiceList } from "@/app/components/services/ServiceList";
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-100" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {error}
        </div>
      ) : (
        <ServiceList services={services} onRefresh={fetchServices} />
      )}
    </DashboardLayout>
  );
}
