"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { BookingForm, BookingFormData } from "./BookingForm";
import { BookingModal } from "./BookingModal";
import { createBooking, updateBooking, updateBookingStatus, deleteBooking } from "@/app/actions/bookings";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ToastContainer } from "@/app/components/ui/Toast";
import { useToast } from "@/app/components/ui/useToast";
import { Button } from "@kobipro/ui";

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

interface BookingListProps {
  bookings: Booking[];
  customers: { id: string; name: string }[];
  services: { id: string; name: string }[];
  staff: { id: string; name: string }[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

export function BookingList({ bookings, customers, services, staff, onRefresh }: BookingListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  async function handleDelete(id: string) {
    if (!confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;
    setLoading(id);
    const result = await deleteBooking(id);
    setLoading(null);
    if (result.success) {
      addToast("Randevu silindi", "success");
      onRefresh();
    } else {
      addToast(result.error || "Silinirken hata oluştu", "error");
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setLoading(id);
    const result = await updateBookingStatus(id, newStatus);
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
        <h2 className="text-xl font-semibold text-slate-100">Randevular</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Yeni Randevu</Button>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Henüz randevu yok"
          description="İlk randevu eklemek için + butonuna tıklayın"
          actionLabel="Yeni Randevu Ekle"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Müşteri</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Hizmet</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Tarih</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Saat</th>
                <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Durum</th>
                <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200">{booking.customer?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{booking.service?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(booking.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{booking.time}</td>
                  <td className="px-5 py-3">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      disabled={loading === booking.id}
                      className={`text-xs px-2 py-1 rounded-md border-0 font-medium cursor-pointer ${statusColors[booking.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingBooking(booking)}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        disabled={loading === booking.id}
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
        <BookingModal title="Yeni Randevu" onClose={() => setIsCreateModalOpen(false)}>
          <BookingForm
            customers={customers}
            services={services}
            staff={staff}
            onSubmit={async (data) => {
              const result = await createBooking(data);
              if (result.success) {
                setIsCreateModalOpen(false);
                addToast("Randevu kaydedildi", "success");
                onRefresh();
              } else {
                addToast(result.error || "Kaydedilirken hata oluştu", "error");
              }
            }}
          />
        </BookingModal>
      )}

      {editingBooking && (
        <BookingModal title="Randevuyu Düzenle" onClose={() => setEditingBooking(null)}>
          <BookingForm
            initialData={{
              customerId: editingBooking.customerId,
              serviceId: editingBooking.serviceId,
              staffId: editingBooking.staffId || undefined,
              date: new Date(editingBooking.date).toISOString().split("T")[0],
              time: editingBooking.time,
              status: editingBooking.status,
              notes: editingBooking.notes,
            }}
            customers={customers}
            services={services}
            staff={staff}
            onSubmit={async (data) => {
              const result = await updateBooking(editingBooking.id, data);
              if (result.success) {
                setEditingBooking(null);
                addToast("Randevu güncellendi", "success");
                onRefresh();
              } else {
                addToast(result.error || "Güncellenirken hata oluştu", "error");
              }
            }}
          />
        </BookingModal>
      )}
    </div>
  );
}
