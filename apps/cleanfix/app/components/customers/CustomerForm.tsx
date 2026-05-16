"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@kobipro/ui";

const customerSchema = z.object({
  name: z.string().min(1, "İsim zorunludur"),
  email: z.string().email("Geçerli bir e-posta girin").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
  };
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export function CustomerForm({ initialData, onSubmit }: CustomerFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
          notes: initialData.notes || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
        },
  });

  async function handleFormSubmit(data: CustomerFormData) {
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
          placeholder="Müşteri adı"
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
            placeholder="ornek@email.com"
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
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Adres</label>
        <textarea
          {...register("address")}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Müşteri adresi"
        />
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
