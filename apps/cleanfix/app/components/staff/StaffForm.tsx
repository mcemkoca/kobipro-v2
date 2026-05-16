"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@kobipro/ui";

const staffSchema = z.object({
  name: z.string().min(1, "İsim zorunludur"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().min(1, "Telefon zorunludur"),
  role: z.string().min(1, "Rol seçimi zorunludur"),
  status: z.string(),
  jobs: z.number().min(0),
});

export type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  initialData?: {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    jobs: number;
  };
  onSubmit: (data: StaffFormData) => Promise<void>;
}

export function StaffForm({ initialData, onSubmit }: StaffFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          phone: initialData.phone,
          role: initialData.role,
          status: initialData.status,
          jobs: initialData.jobs || 0,
        }
      : {
          name: "",
          email: "",
          phone: "",
          role: "Teknisyen",
          status: "Aktif",
          jobs: 0,
        },
  });

  async function handleFormSubmit(data: StaffFormData) {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">İsim</label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Personel adı"
        />
        {errors.name && (
          <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">E-posta</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ornek@cleanfix.com"
          />
          {errors.email && (
            <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Telefon</label>
          <input
            {...register("phone")}
            type="tel"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+90 5XX XXX XXXX"
          />
          {errors.phone && (
            <p className="text-rose-400 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Rol</label>
          <select
            {...register("role")}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Teknisyen">Teknisyen</option>
            <option value="Sorumlu">Sorumlu</option>
            <option value="Yönetici">Yönetici</option>
          </select>
          {errors.role && (
            <p className="text-rose-400 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Durum</label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Aktif">Aktif</option>
            <option value="İzinli">İzinli</option>
            <option value="Pasif">Pasif</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Tamamlanan İş</label>
        <input
          {...register("jobs", { valueAsNumber: true })}
          type="number"
          min={0}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
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
