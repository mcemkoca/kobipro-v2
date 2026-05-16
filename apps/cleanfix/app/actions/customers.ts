"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

// Demo data fallback when database is unavailable
const DEMO_CUSTOMERS = [
  { id: "cust-1", name: "Ahmet Yılmaz", email: "ahmet@email.com", phone: "+905551234567", address: "Kadıköy, İstanbul", notes: "VIP müşteri", createdAt: new Date("2025-01-10"), updatedAt: new Date("2025-01-10") },
  { id: "cust-2", name: "Elif Kaya", email: "elif@email.com", phone: "+905552345678", address: "Beşiktaş, İstanbul", notes: "", createdAt: new Date("2025-01-15"), updatedAt: new Date("2025-01-15") },
  { id: "cust-3", name: "Mehmet Demir", email: "mehmet@email.com", phone: "+905553456789", address: "Şişli, İstanbul", notes: "Haftalık temizlik", createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
  { id: "cust-4", name: "Selen Aktaş", email: "selen@email.com", phone: "+905554567890", address: "Üsküdar, İstanbul", notes: "", createdAt: new Date("2025-02-15"), updatedAt: new Date("2025-02-15") },
  { id: "cust-5", name: "Burak Özdemir", email: "burak@email.com", phone: "+905555678901", address: "Ataşehir, İstanbul", notes: "İki kedisi var", createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01") },
  { id: "cust-6", name: "Canan Şahin", email: "canan@email.com", phone: "+905556789012", address: "Maltepe, İstanbul", notes: "", createdAt: new Date("2025-03-10"), updatedAt: new Date("2025-03-10") },
  { id: "cust-7", name: "Emre Kılıç", email: "emre@email.com", phone: "+905557890123", address: "Beylikdüzü, İstanbul", notes: "Ofis temizliği", createdAt: new Date("2025-03-20"), updatedAt: new Date("2025-03-20") },
  { id: "cust-8", name: "Zeynep Çelik", email: "zeynep@email.com", phone: "+905558901234", address: "Bakırköy, İstanbul", notes: "", createdAt: new Date("2025-04-01"), updatedAt: new Date("2025-04-01") },
  { id: "cust-9", name: "Kerem Arslan", email: "kerem@email.com", phone: "+905559012345", address: "Pendik, İstanbul", notes: "Halı yıkama düzenli", createdAt: new Date("2025-04-10"), updatedAt: new Date("2025-04-10") },
  { id: "cust-10", name: "Ayşe Yıldız", email: "ayse@email.com", phone: "+905550123456", address: "Kartal, İstanbul", notes: "", createdAt: new Date("2025-04-20"), updatedAt: new Date("2025-04-20") },
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

export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: customers };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: DEMO_CUSTOMERS };
    return { success: false, error: "Müşteriler yüklenirken hata oluştu" };
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { bookings: { include: { service: true } } },
    });
    return { success: true, data: customer };
  } catch (error) {
    if (isDbError(error)) {
      const cust = DEMO_CUSTOMERS.find(c => c.id === id);
      return { success: true, data: cust ? { ...cust, bookings: [] } : null };
    }
    return { success: false, error: "Müşteri bulunurken hata oluştu" };
  }
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const createData: any = { name: data.name };
    if (data.email) createData.email = data.email;
    if (data.phone) createData.phone = data.phone;
    if (data.address) createData.address = data.address;
    if (data.notes) createData.notes = data.notes;

    const customer = await prisma.customer.create({
      data: createData,
    });
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error) {
    if (isDbError(error)) {
      const mock = {
        id: `cust-${Date.now()}`,
        name: data.name,
        email: data.email || `${Date.now()}@demo.local`,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Müşteri oluşturulurken hata oluştu" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }
) {
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data,
    });
    revalidatePath("/customers");
    return { success: true, data: customer };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_CUSTOMERS.find(c => c.id === id);
      const mock = { ...(existing || DEMO_CUSTOMERS[0]), ...data, updatedAt: new Date() };
      return { success: true, data: mock };
    }
    return { success: false, error: "Müşteri güncellenirken hata oluştu" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    if (isDbError(error)) return { success: true };
    return { success: false, error: "Müşteri silinirken hata oluştu" };
  }
}
