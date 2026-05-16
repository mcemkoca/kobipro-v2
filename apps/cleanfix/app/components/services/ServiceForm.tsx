"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@kobipro/ui";

const serviceSchema = z.object({
  name: z.string().min(1, "İsim zorunludur"),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Fiyat 0 veya daha yüksek olmalı")),
  duration: z.preprocess((val) => Number(val), z.number().min(5, "Süre en az 5 dakika olmalı")),
  active: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  initialData?: {
    name: string;
    description: string | null;
    price: number;
    duration: number;
    active: boolean;
  };
  onSubmit: (data: ServiceFormData) => Promise<void>;
}

export function ServiceForm({ initialData, onSubmit }: ServiceFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          price: Number(initialData.price),
          duration: initialData.duration,
          active: initialData.active,
        }
      : {
          name: "",
          description: "",
          price: 0,
          duration: 60,
          active: true,
        },
  });

  async function handleFormSubmit(data: ServiceFormData) {
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
        <label className="block text-sm font-medium mb-1 text-slate-300">İsim</label>
        <input
          {...register("name")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Hizmet adı"
        />
        {errors.name && (
          <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Açıklama</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Hizmet açıklaması"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Fiyat (₺)</label>
          <input
            {...register("price")}
            type="number"
            step="0.01"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.price && (
            <p className="text-rose-400 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Süre (dk)</label>
          <input
            {...register("duration")}
            type="number"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.duration && (
            <p className="text-rose-400 text-xs mt-1">{errors.duration.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          {...register("active")}
          type="checkbox"
          id="active"
          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
        />
        <label htmlFor="active" className="text-sm text-slate-300">
          Aktif
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
