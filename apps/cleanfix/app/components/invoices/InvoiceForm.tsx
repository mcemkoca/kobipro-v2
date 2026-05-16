"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@kobipro/ui";
import { Plus, Trash2 } from "lucide-react";

const invoiceItemSchema = z.object({
  service: z.string().min(1, "Hizmet adı zorunludur"),
  quantity: z.number().min(1, "Adet en az 1 olmalı"),
  unitPrice: z.number().min(0, "Fiyat 0 veya daha büyük olmalı"),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçimi zorunludur"),
  number: z.string().min(1, "Fatura numarası zorunludur"),
  date: z.string().min(1, "Tarih zorunludur"),
  dueDate: z.string().min(1, "Son ödeme tarihi zorunludur"),
  status: z.string().default("DRAFT"),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "En az bir kaleminiz olmalı"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  initialData?: {
    customerId: string;
    number: string;
    date: string;
    dueDate: string;
    status: string;
    notes: string | null;
    items: { service: string; quantity: number; unitPrice: number }[];
  };
  customers: { id: string; name: string }[];
  onSubmit: (data: InvoiceFormData) => Promise<void>;
}

export function InvoiceForm({ initialData, customers, onSubmit }: InvoiceFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: initialData
      ? {
          customerId: initialData.customerId,
          number: initialData.number,
          date: initialData.date,
          dueDate: initialData.dueDate,
          status: initialData.status,
          notes: initialData.notes || "",
          items: initialData.items,
        }
      : {
          customerId: "",
          number: "",
          date: new Date().toISOString().split("T")[0],
          dueDate: "",
          status: "DRAFT",
          notes: "",
          items: [{ service: "", quantity: 1, unitPrice: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const total = items?.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0) || 0;

  async function handleFormSubmit(data: InvoiceFormData) {
    setSubmitting(true);
    try {
      await onSubmit({ ...data, items: data.items });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Fatura Numarası</label>
          <input
            {...register("number")}
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="F-XXXX"
          />
          {errors.number && <p className="text-rose-400 text-xs mt-1">{errors.number.message}</p>}
        </div>
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
          <label className="block text-sm font-medium mb-1 text-slate-300">Son Ödeme</label>
          <input
            {...register("dueDate")}
            type="date"
            className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.dueDate && <p className="text-rose-400 text-xs mt-1">{errors.dueDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Durum</label>
        <select
          {...register("status")}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="DRAFT">Taslak</option>
          <option value="PAID">Ödendi</option>
          <option value="SENT">Ödenmedi</option>
          <option value="OVERDUE">Gecikti</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Notlar</label>
        <textarea
          {...register("notes")}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ek notlar..."
        />
      </div>

      {/* Line Items */}
      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-300">Kalemler</label>
          <button
            type="button"
            onClick={() => append({ service: "", quantity: 1, unitPrice: 0 })}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
          >
            <Plus size={12} />
            Kalem Ekle
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                <input
                  {...register(`items.${index}.service` as const)}
                  placeholder="Hizmet"
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="Adet"
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-3">
                <input
                  {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="Birim Fiyat"
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="text-xs text-slate-400">
                  ₺{((items?.[index]?.quantity || 0) * (items?.[index]?.unitPrice || 0)).toLocaleString("tr-TR")}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 rounded text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {errors.items && <p className="text-rose-400 text-xs mt-2">{errors.items.message}</p>}

        <div className="flex justify-end mt-3 pt-2 border-t border-slate-800">
          <span className="text-sm font-semibold text-slate-200">Toplam: ₺{total.toLocaleString("tr-TR")}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
