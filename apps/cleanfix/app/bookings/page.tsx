"use client";

import { useEffect, useState, useCallback } from "react";
import { getBookings } from "@/app/actions/bookings";
import { getCustomers } from "@/app/actions/customers";
import { getServices } from "@/app/actions/services";
import { getStaff } from "@/app/actions/staff";
import { BookingList } from "@/app/components/bookings/BookingList";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string | null;
  date: Date;
  time: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  customer: { id: string; name: string };
  service: { id: string; name: string };
  staff: { id: string; name: string } | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, customersRes, servicesRes, staffRes] = await Promise.all([
      getBookings(),
      getCustomers(),
      getServices(),
      getStaff(),
    ]);

    let staffData: { id: string; name: string }[] = [];
    if (staffRes.success) {
      staffData = staffRes.data?.map((s: any) => ({ id: s.id, name: s.name })) || [];
    }

    if (bookingsRes.success) {
      setBookings(bookingsRes.data || []);
      setError(null);
    } else {
      setError(bookingsRes.error || "Bilinmeyen hata");
    }

    if (customersRes.success) {
      setCustomers(customersRes.data?.map((c: any) => ({ id: c.id, name: c.name })) || []);
    }

    if (servicesRes.success) {
      setServices(servicesRes.data?.map((s: any) => ({ id: s.id, name: s.name })) || []);
    }

    setStaff(staffData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardLayout pageTitle="Randevular">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-100" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {error}
        </div>
      ) : (
        <BookingList
          bookings={bookings}
          customers={customers}
          services={services}
          staff={staff}
          onRefresh={fetchData}
        />
      )}
    </DashboardLayout>
  );
}
