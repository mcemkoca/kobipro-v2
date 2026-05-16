"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import { ServiceForm, ServiceFormData } from "./ServiceForm";
import { ServiceModal } from "./ServiceModal";
import { createService, updateService, deleteService, toggleServiceStatus } from "@/app/actions/services";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { Button } from "@kobipro/ui";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
  createdAt: Date;
}

interface ServiceListProps {
  services: Service[];
  onRefresh: () => void;
}

export function ServiceList({ services, onRefresh }: ServiceListProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  async function handleDelete(id: string) {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    setLoading(id);
    const result = await deleteService(id);
    setLoading(null);
    if (result.success) {
      addToast("Hizmet silindi", "success");
      onRefresh();
    } else {
      addToast(result.error || "Silinirken hata oluştu", "error");
    }
  }

  async function handleToggleStatus(id: string) {
    setLoading(id);
    const result = await toggleServiceStatus(id);
    setLoading(null);
    if (result.success) {
      addToast("Durum güncellendi", "success");
      onRefresh();
    } else {
      addToast(result.error || "Durum değiştirilirken hata oluştu", "error");
    }
  }

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-100">Hizmetler</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Yeni Hizmet</Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Henüz hizmet yok"
          description="İlk hizmet eklemek için + butonuna tıklayın"
          actionLabel="Yeni Hizmet Ekle"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">İsim</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Açıklama</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Fiyat</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Süre</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Durum</th>
                <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200">{service.name}</td>
                  <td className="px-5 py-3 text-slate-400 max-w-xs truncate">
                    {service.description || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-200">{Number(service.price).toFixed(2)} ₺</td>
                  <td className="px-5 py-3 text-slate-400">{service.duration} dk</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleStatus(service.id)}
                      disabled={loading === service.id}
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        service.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {service.active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingService(service)}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={loading === service.id}
                        className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateModalOpen && (
        <ServiceModal title="Yeni Hizmet" onClose={() => setIsCreateModalOpen(false)}>
          <ServiceForm
            onSubmit={async (data) => {
              const result = await createService(data);
              if (result.success) {
                setIsCreateModalOpen(false);
                addToast("Hizmet kaydedildi", "success");
                onRefresh();
              } else {
                addToast(result.error || "Kaydedilirken hata oluştu", "error");
              }
            }}
          />
        </ServiceModal>
      )}

      {editingService && (
        <ServiceModal title="Hizmeti Düzenle" onClose={() => setEditingService(null)}>
          <ServiceForm
            initialData={editingService}
            onSubmit={async (data) => {
              const result = await updateService(editingService.id, data);
              if (result.success) {
                setEditingService(null);
                addToast("Hizmet güncellendi", "success");
                onRefresh();
              } else {
                addToast(result.error || "Güncellenirken hata oluştu", "error");
              }
            }}
          />
        </ServiceModal>
      )}
    </div>
  );
}
