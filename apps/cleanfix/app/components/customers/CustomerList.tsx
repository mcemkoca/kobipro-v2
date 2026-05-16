"use client";

import { useState } from "react";
import { CustomerForm, CustomerFormData } from "./CustomerForm";
import { CustomerModal } from "./CustomerModal";
import { createCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customers";
import { Button } from "@kobipro/ui";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
}

interface CustomerListProps {
  customers: Customer[];
  onRefresh: () => void;
}

export function CustomerList({ customers, onRefresh }: CustomerListProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    setLoading(id);
    const result = await deleteCustomer(id);
    setLoading(null);
    if (result.success) {
      onRefresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-100">Müşteriler</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Yeni Müşteri</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">İsim</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">E-posta</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Telefon</th>
              <th className="px-5 py-3 text-left font-medium text-slate-400 text-xs uppercase tracking-wider">Adres</th>
              <th className="px-5 py-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                  Henüz müşteri yok. Yeni bir müşteri ekleyin.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-5 py-3 font-medium text-slate-200">{customer.name}</td>
                <td className="px-5 py-3 text-slate-400">{customer.email || "—"}</td>
                <td className="px-5 py-3 text-slate-200">{customer.phone || "—"}</td>
                <td className="px-5 py-3 text-slate-400 max-w-xs truncate">
                  {customer.address || "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                      className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      {expandedCustomer === customer.id ? "Kapat" : "Detay"}
                    </button>
                    <button
                      onClick={() => setEditingCustomer(customer)}
                      className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={loading === customer.id}
                      className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.map((customer) =>
              expandedCustomer === customer.id ? (
                <tr key={`${customer.id}-detail`}>
                  <td colSpan={5} className="px-5 py-3 bg-slate-800/30">
                    <div className="text-sm space-y-1">
                      {customer.notes && (
                        <p className="text-slate-400">
                          <span className="font-medium text-slate-300">Notlar:</span> {customer.notes}
                        </p>
                      )}
                      <p className="text-slate-500 text-xs">
                        Oluşturulma: {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <CustomerModal title="Yeni Müşteri" onClose={() => setIsCreateModalOpen(false)}>
          <CustomerForm
            onSubmit={async (data) => {
              const result = await createCustomer(data);
              if (result.success) {
                setIsCreateModalOpen(false);
                onRefresh();
              } else {
                alert(result.error);
              }
            }}
          />
        </CustomerModal>
      )}

      {editingCustomer && (
        <CustomerModal title="Müşteriyi Düzenle" onClose={() => setEditingCustomer(null)}>
          <CustomerForm
            initialData={editingCustomer}
            onSubmit={async (data) => {
              const result = await updateCustomer(editingCustomer.id, data);
              if (result.success) {
                setEditingCustomer(null);
                onRefresh();
              } else {
                alert(result.error);
              }
            }}
          />
        </CustomerModal>
      )}
    </div>
  );
}
