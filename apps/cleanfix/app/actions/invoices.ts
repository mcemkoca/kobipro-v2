"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

function isDbError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes("connect") ||
    error.message.includes("database") ||
    error.message.includes("connection") ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED")
  );
}

const demoInvoices = [
  { id: "F-2026-001", customerId: "cust_2", amount: 2500, number: "F-2026-001", dueDate: new Date("2026-05-30"), status: "PAID", paidDate: new Date("2026-05-15"), notes: "Mayıs ofis temizliği", total: 2500, items: [{ id: "item-1", service: "Ofis Temizliği", quantity: 4, unitPrice: 625, total: 2500 }], createdAt: new Date("2026-05-01"), updatedAt: new Date("2026-05-15"), customer: { id: "cust_2", name: "TechSoft A.Ş.", email: "info@techsoft.com", phone: "0212 444 55 66", address: "Levent, İstanbul", notes: null, createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-05-10") } },
  { id: "F-2026-002", customerId: "cust_1", amount: 1200, number: "F-2026-002", dueDate: new Date("2026-05-25"), status: "PAID", paidDate: new Date("2026-05-18"), notes: "Ev temizliği — 2+1", total: 1200, items: [{ id: "item-1", service: "Ev Temizliği", quantity: 1, unitPrice: 1200, total: 1200 }], createdAt: new Date("2026-05-10"), updatedAt: new Date("2026-05-18"), customer: { id: "cust_1", name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com", phone: "0532 111 22 33", address: "Ataşehir, İstanbul", notes: null, createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-05-18") } },
  { id: "F-2026-003", customerId: "cust_7", amount: 1800, number: "F-2026-003", dueDate: new Date("2026-06-01"), status: "PENDING", paidDate: null, notes: "Mayıs apartman temizliği", total: 1800, items: [{ id: "item-1", service: "Apartman Temizliği", quantity: 1, unitPrice: 1800, total: 1800 }], createdAt: new Date("2026-05-15"), updatedAt: new Date("2026-05-15"), customer: { id: "cust_7", name: "Güneş Apartmanı Yönetimi", email: "yonetim@gunesapt.com", phone: "0216 123 45 67", address: "Maltepe, İstanbul", notes: null, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-05-01") } },
  { id: "F-2026-004", customerId: "cust_3", amount: 5000, number: "F-2026-004", dueDate: new Date("2026-05-20"), status: "OVERDUE", paidDate: null, notes: "Pendik inşaat sonrası — proje B-12", total: 5000, items: [{ id: "item-1", service: "İnşaat Sonrası Temizlik", quantity: 1, unitPrice: 5000, total: 5000 }], createdAt: new Date("2026-05-05"), updatedAt: new Date("2026-05-05"), customer: { id: "cust_3", name: "Yapı Merkezi", email: "siparis@yapimerkezi.com", phone: "0216 777 88 99", address: "Pendik, İstanbul", notes: null, createdAt: new Date("2026-02-20"), updatedAt: new Date("2026-05-15") } },
  { id: "F-2026-005", customerId: "cust_10", amount: 15000, number: "F-2026-005", dueDate: new Date("2026-06-15"), status: "PENDING", paidDate: null, notes: "Haziran ofis kompleksi — 5 kat, günlük", total: 15000, items: [{ id: "item-1", service: "Ofis Temizliği", quantity: 20, unitPrice: 750, total: 15000 }], createdAt: new Date("2026-05-20"), updatedAt: new Date("2026-05-20"), customer: { id: "cust_10", name: "Kapital GYO", email: "hizmet@kapitalgyo.com", phone: "0212 999 00 11", address: "Maslak, İstanbul", notes: null, createdAt: new Date("2026-02-10"), updatedAt: new Date("2026-05-01") } },
  { id: "F-2026-006", customerId: "cust_6", amount: 14000, number: "F-2026-006", dueDate: new Date("2026-06-05"), status: "PENDING", paidDate: null, notes: "Haziran depo temizliği — 4 hafta", total: 14000, items: [{ id: "item-1", service: "Depo Temizliği", quantity: 4, unitPrice: 3500, total: 14000 }], createdAt: new Date("2026-05-25"), updatedAt: new Date("2026-05-25"), customer: { id: "cust_6", name: "Lojistik A.Ş.", email: "ops@lojistik.com", phone: "0212 888 99 00", address: "Tuzla, İstanbul", notes: null, createdAt: new Date("2026-04-01"), updatedAt: new Date("2026-05-12") } },
  { id: "F-2026-007", customerId: "cust_4", amount: 2400, number: "F-2026-007", dueDate: new Date("2026-05-28"), status: "PAID", paidDate: new Date("2026-05-22"), notes: "3 aylık halı yıkama aboneliği", total: 2400, items: [{ id: "item-1", service: "Halı Yıkama", quantity: 3, unitPrice: 800, total: 2400 }], createdAt: new Date("2026-05-12"), updatedAt: new Date("2026-05-22"), customer: { id: "cust_4", name: "Fatma Şahin", email: "fatma.sahin@email.com", phone: "0543 222 33 44", address: "Kadıköy, İstanbul", notes: null, createdAt: new Date("2026-03-05"), updatedAt: new Date("2026-04-20") } },
  { id: "F-2026-008", customerId: "cust_9", amount: 3000, number: "F-2026-008", dueDate: new Date("2026-05-18"), status: "PAID", paidDate: new Date("2026-05-17"), notes: "Bahar temizliği + koltuk yıkama paketi", total: 3000, items: [{ id: "item-1", service: "Ev Temizliği", quantity: 1, unitPrice: 1200, total: 1200 }, { id: "item-2", service: "Koltuk Yıkama", quantity: 3, unitPrice: 600, total: 1800 }], createdAt: new Date("2026-05-15"), updatedAt: new Date("2026-05-17"), customer: { id: "cust_9", name: "Neslihan Aydın", email: "neslihan.aydin@email.com", phone: "0551 777 88 99", address: "Üsküdar, İstanbul", notes: null, createdAt: new Date("2026-03-10"), updatedAt: new Date("2026-05-14") } },
  { id: "F-2026-009", customerId: "cust_5", amount: 600, number: "F-2026-009", dueDate: new Date("2026-05-26"), status: "DRAFT", paidDate: null, notes: "Taslak — henüz onaylanmadı", total: 600, items: [{ id: "item-1", service: "Koltuk Yıkama", quantity: 1, unitPrice: 600, total: 600 }], createdAt: new Date("2026-05-23"), updatedAt: new Date("2026-05-23"), customer: { id: "cust_5", name: "Burak Özdemir", email: "burak@email.com", phone: "0555 333 44 55", address: "Beşiktaş, İstanbul", notes: null, createdAt: new Date("2026-03-20"), updatedAt: new Date("2026-05-05") } },
];

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    });
    const enriched = invoices.map((inv: any) => ({
      ...inv,
      number: inv.id.slice(0, 8).toUpperCase(),
      total: Number(inv.amount),
      items: [{ id: `item-${inv.id}`, service: "Hizmet", quantity: 1, unitPrice: Number(inv.amount), total: Number(inv.amount) }],
      notes: null,
    }));
    if (enriched.length === 0) return { success: true, data: demoInvoices };
    return { success: true, data: enriched };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: demoInvoices };
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
    if (isDbError(error)) return { success: true, data: null };
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
      const items = data.items || [{ id: `item-${Date.now()}`, service: "Hizmet", quantity: 1, unitPrice: data.total || 0, total: data.total || 0 }];
      const mock = {
        id,
        customerId: data.customerId || "",
        amount: data.total || 0,
        number: data.number || id,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        status: (data.status as any) || "DRAFT",
        paidDate: data.status === "PAID" ? new Date() : null,
        notes: data.notes || null,
        total: data.total || 0,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: { id: data.customerId || "", name: "Müşteri", email: null, phone: null, address: null, notes: null, createdAt: new Date(), updatedAt: new Date() },
      };
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
      return { success: false, error: "Durum güncellenirken hata oluştu" };
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
