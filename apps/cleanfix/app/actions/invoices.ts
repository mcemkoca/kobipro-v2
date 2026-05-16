"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

// Demo data fallback when database is unavailable
const DEMO_INVOICES = [
  {
    id: "F-1024",
    customerId: "cust-1",
    amount: 450,
    customer: { id: "cust-1", name: "Ahmet Yılmaz", email: "ahmet@email.com", phone: "+905551234567", address: "Kadıköy, İstanbul", notes: "VIP müşteri", createdAt: new Date("2025-01-10"), updatedAt: new Date("2025-01-10") },
    dueDate: new Date("2025-06-17"),
    status: "PAID" as const,
    paidDate: new Date("2025-05-17"),
    createdAt: new Date("2025-05-17"),
    updatedAt: new Date("2025-05-17"),
    items: [
      { id: "item-1", service: "Ev Temizliği", quantity: 1, unitPrice: 450, total: 450 },
    ],
    number: "F-1024",
    notes: "Ev Temizliği",
  },
  {
    id: "F-1023",
    customerId: "cust-2",
    amount: 1200,
    customer: { id: "cust-2", name: "Ayşe Kaya", email: "elif@email.com", phone: "+905552345678", address: "Beşiktaş, İstanbul", notes: "", createdAt: new Date("2025-01-15"), updatedAt: new Date("2025-01-15") },
    dueDate: new Date("2025-06-17"),
    status: "SENT" as const,
    paidDate: null,
    createdAt: new Date("2025-05-17"),
    updatedAt: new Date("2025-05-17"),
    items: [
      { id: "item-2", service: "Ofis Temizliği", quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    number: "F-1023",
    notes: "Ofis Temizliği",
  },
  {
    id: "F-1022",
    customerId: "cust-3",
    amount: 320,
    customer: { id: "cust-3", name: "Mehmet Demir", email: "mehmet@email.com", phone: "+905553456789", address: "Şişli, İstanbul", notes: "Haftalık temizlik", createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
    dueDate: new Date("2025-06-16"),
    status: "PAID" as const,
    paidDate: new Date("2025-05-16"),
    createdAt: new Date("2025-05-16"),
    updatedAt: new Date("2025-05-16"),
    items: [
      { id: "item-3", service: "Halı Yıkama", quantity: 1, unitPrice: 320, total: 320 },
    ],
    number: "F-1022",
    notes: "Halı Yıkama",
  },
  {
    id: "F-1021",
    customerId: "cust-4",
    amount: 280,
    customer: { id: "cust-4", name: "Fatma Şahin", email: "selen@email.com", phone: "+905554567890", address: "Üsküdar, İstanbul", notes: "", createdAt: new Date("2025-02-15"), updatedAt: new Date("2025-02-15") },
    dueDate: new Date("2025-06-16"),
    status: "OVERDUE" as const,
    paidDate: null,
    createdAt: new Date("2025-05-16"),
    updatedAt: new Date("2025-05-16"),
    items: [
      { id: "item-4", service: "Koltuk Yıkama", quantity: 1, unitPrice: 280, total: 280 },
    ],
    number: "F-1021",
    notes: "Koltuk Yıkama",
  },
  {
    id: "F-1020",
    customerId: "cust-5",
    amount: 2100,
    customer: { id: "cust-5", name: "Ali Can", email: "burak@email.com", phone: "+905555678901", address: "Ataşehir, İstanbul", notes: "İki kedisi var", createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01") },
    dueDate: new Date("2025-06-15"),
    status: "PAID" as const,
    paidDate: new Date("2025-05-15"),
    createdAt: new Date("2025-05-15"),
    updatedAt: new Date("2025-05-15"),
    items: [
      { id: "item-5", service: "Dış Cephe Temizliği", quantity: 1, unitPrice: 2100, total: 2100 },
    ],
    number: "F-1020",
    notes: "Dış Cephe",
  },
  {
    id: "F-1019",
    customerId: "cust-1",
    amount: 500,
    customer: { id: "cust-1", name: "Zeynep Arslan", email: "ahmet@email.com", phone: "+905551234567", address: "Kadıköy, İstanbul", notes: "VIP müşteri", createdAt: new Date("2025-01-10"), updatedAt: new Date("2025-01-10") },
    dueDate: new Date("2025-06-15"),
    status: "DRAFT" as const,
    paidDate: null,
    createdAt: new Date("2025-05-15"),
    updatedAt: new Date("2025-05-15"),
    items: [
      { id: "item-6", service: "Ev Temizliği", quantity: 1, unitPrice: 500, total: 500 },
    ],
    number: "F-1019",
    notes: "Ev Temizliği",
  },
];

function isDbError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes("connect") ||
    error.message.includes("database") ||
    error.message.includes("connection") ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED")
  );
}

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      },
    });
    // Enrich with computed fields for UI compatibility
    const enriched = invoices.map((inv: any) => ({
      ...inv,
      number: inv.id.slice(0, 8).toUpperCase(),
      total: Number(inv.amount),
      items: [{ id: `item-${inv.id}`, service: "Hizmet", quantity: 1, unitPrice: Number(inv.amount), total: Number(inv.amount) }],
      notes: null,
    }));
    return { success: true, data: enriched };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: DEMO_INVOICES };
    return { success: false, error: "Faturalar yüklenirken hata oluştu" };
  }
}

export async function getInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
    if (!invoice) return { success: true, data: null };
    const enriched = {
      ...invoice,
      number: invoice.id.slice(0, 8).toUpperCase(),
      total: Number(invoice.amount),
      items: [{ id: `item-${invoice.id}`, service: "Hizmet", quantity: 1, unitPrice: Number(invoice.amount), total: Number(invoice.amount) }],
      notes: null,
    };
    return { success: true, data: enriched };
  } catch (error) {
    if (isDbError(error)) {
      const inv = DEMO_INVOICES.find(i => i.id === id);
      return { success: true, data: inv || null };
    }
    return { success: false, error: "Fatura bulunurken hata oluştu" };
  }
}

export async function createInvoice(data: {
  customerId: string;
  number?: string;
  date?: string;
  dueDate: string;
  status?: string;
  notes?: string;
  total?: number;
  items?: { service: string; quantity: number; unitPrice: number }[];
}) {
  try {
    const invoice = await prisma.invoice.create({
      data: {
        customerId: data.customerId,
        amount: data.total || 0,
        status: (data.status as any) || "DRAFT",
        dueDate: new Date(data.dueDate),
      },
      include: {
        customer: true,
      },
    });
    revalidatePath("/invoices");
    const enriched = {
      ...invoice,
      number: data.number || invoice.id.slice(0, 8).toUpperCase(),
      total: Number(invoice.amount),
      items: data.items?.map((item, i) => ({
        id: `item-${invoice.id}-${i}`,
        service: item.service,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })) || [{ id: `item-${invoice.id}`, service: "Hizmet", quantity: 1, unitPrice: Number(invoice.amount), total: Number(invoice.amount) }],
      notes: data.notes || null,
    };
    return { success: true, data: enriched };
  } catch (error) {
    if (isDbError(error)) {
      const items = data.items?.map((item, i) => ({
        id: `item-${Date.now()}-${i}`,
        service: item.service,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })) || [{ id: `item-${Date.now()}`, service: "Hizmet", quantity: 1, unitPrice: data.total || 0, total: data.total || 0 }];
      const mock = {
        id: `F-${Date.now()}`,
        customerId: data.customerId,
        amount: data.total || 0,
        number: data.number || `F-${Date.now()}`,
        dueDate: new Date(data.dueDate),
        status: (data.status as any) || "DRAFT",
        paidDate: data.status === "PAID" ? new Date() : null,
        notes: data.notes || null,
        total: data.total || 0,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: { id: data.customerId, name: "Müşteri", email: null, phone: null, address: null, notes: null, createdAt: new Date(), updatedAt: new Date() },
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Fatura oluşturulurken hata oluştu" };
  }
}

export async function updateInvoice(
  id: string,
  data: {
    customerId?: string;
    number?: string;
    date?: string;
    dueDate?: string;
    status?: string;
    notes?: string;
    total?: number;
    items?: { id?: string; service: string; quantity: number; unitPrice: number }[];
  }
) {
  try {
    const updateData: any = {};
    if (data.customerId) updateData.customerId = data.customerId;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status) {
      updateData.status = data.status as any;
      if (data.status === "PAID") updateData.paidDate = new Date();
      if (data.status !== "PAID") updateData.paidDate = null;
    }
    if (data.total !== undefined) updateData.amount = data.total;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });
    revalidatePath("/invoices");
    const enriched = {
      ...invoice,
      number: data.number || invoice.id.slice(0, 8).toUpperCase(),
      total: Number(invoice.amount),
      items: data.items?.map((item, i) => ({
        id: item.id || `item-${invoice.id}-${i}`,
        service: item.service,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })) || [{ id: `item-${invoice.id}`, service: "Hizmet", quantity: 1, unitPrice: Number(invoice.amount), total: Number(invoice.amount) }],
      notes: data.notes !== undefined ? data.notes : null,
    };
    return { success: true, data: enriched };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_INVOICES.find(i => i.id === id);
      const items = data.items || existing?.items || [];
      const mock = { ...(existing || DEMO_INVOICES[0]), ...data, items, updatedAt: new Date() };
      if (data.dueDate) mock.dueDate = new Date(data.dueDate);
      if (data.status) {
        mock.status = data.status as any;
        mock.paidDate = data.status === "PAID" ? new Date() : null;
      }
      return { success: true, data: mock };
    }
    return { success: false, error: "Fatura güncellenirken hata oluştu" };
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    const updateData: any = { status: status as any };
    if (status === "PAID") updateData.paidDate = new Date();
    if (status !== "PAID") updateData.paidDate = null;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/invoices");
    return { success: true, data: invoice };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_INVOICES.find(i => i.id === id);
      const mock = existing ? { ...existing, status, paidDate: status === "PAID" ? new Date() : null, updatedAt: new Date() } : null;
      return { success: true, data: mock };
    }
    return { success: false, error: "Durum güncellenirken hata oluştu" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/invoices");
    return { success: true };
  } catch (error) {
    if (isDbError(error)) return { success: true };
    return { success: false, error: "Fatura silinirken hata oluştu" };
  }
}
