"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@kobipro/ui";

const bookingSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunludur"),
  serviceId: z.string().min(1, "Hizmet seçimi zorunludur"),
  staffId: z.string().optional(),
  date: z.string().min(1, "Tarih zorunludur"),
  time: z.string().min(1, "Saat zorunludur"),
  status: z.string().default("PENDING"),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  initialData?: {
    customerId: string;
    serviceId: string;
    staffId?: string;
    date: string;
    time: string;
    status: string;
    notes: string | null;
  };
  customers: { id: string; name: string }[];
  services: { id: string; name: string }[];
  staff: { id: string; name: string }[];
  onSubmit: (data: BookingFormData) => Promise<void>;
}

export function BookingForm({ initialData, customers, services, staff, onSubmit }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema) as any,
    defaultValues: initialData
      ? {
          customerId: initialData.customerId,
          serviceId: initialData.serviceId,
          staffId: initialData.staffId || "",
          date: initialData.date,
          time: initialData.time,
          status: initialData.status,
          notes: initialData.notes || "",
        }
      : {
          customerId: "",
          serviceId: "",
          staffId: "",
          date: "",
          time: "",
          status: "PENDING",
          notes: "",
        },
  });

  async function handleFormSubmit(data: BookingFormData) {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Müşteri</label>
        <select
          {...register("customerId")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Müşteri seçin</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.customerId && <p className="text-rose-400 text-xs mt-1">{errors.customerId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Hizmet</label>
        <select
          {...register("serviceId")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Hizmet seçin</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.serviceId && <p className="text-rose-400 text-xs mt-1">{errors.serviceId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Personel (Opsiyonel)</label>
        <select
          {...register("staffId")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Personel seçin</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Tarih</label>
          <input
            {...register("date")}
            type="date"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && <p className="text-rose-400 text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Saat</label>
          <input
            {...register("time")}
            type="time"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.time && <p className="text-rose-400 text-xs mt-1">{errors.time.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Durum</label>
        <select
          {...register("status")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="PENDING">Bekliyor</option>
          <option value="CONFIRMED">Onaylandı</option>
          <option value="IN_PROGRESS">Devam Ediyor</option>
          <option value="COMPLETED">Tamamlandı</option>
          <option value="CANCELLED">İptal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Notlar</label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ek notlar..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
