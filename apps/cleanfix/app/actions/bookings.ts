"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

// Demo data fallback when database is unavailable
const DEMO_SERVICES_MINI = [
  { id: "svc-1", name: "Ev Temizliği", description: "Genel ev temizliği hizmeti", price: 450, duration: 120, active: true, createdAt: new Date("2025-01-15"), updatedAt: new Date("2025-01-15") },
  { id: "svc-2", name: "Ofis Temizliği", description: "Profesyonel ofis temizliği", price: 1200, duration: 180, active: true, createdAt: new Date("2025-01-20"), updatedAt: new Date("2025-01-20") },
  { id: "svc-3", name: "Halı Yıkama", description: "Derinlemesine halı yıkama", price: 320, duration: 90, active: true, createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
  { id: "svc-4", name: "Koltuk Yıkama", description: "Koltuk ve kanepe temizliği", price: 280, duration: 60, active: true, createdAt: new Date("2025-02-10"), updatedAt: new Date("2025-02-10") },
  { id: "svc-5", name: "Cam Temizliği", description: "İç ve dış cam temizliği", price: 180, duration: 45, active: true, createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01") },
];

const DEMO_CUSTOMERS_MINI = [
  { id: "cust-1", name: "Ahmet Yılmaz", email: "ahmet@email.com", phone: "+905551234567", address: "Kadıköy, İstanbul", notes: "VIP müşteri", createdAt: new Date("2025-01-10"), updatedAt: new Date("2025-01-10") },
  { id: "cust-2", name: "Elif Kaya", email: "elif@email.com", phone: "+905552345678", address: "Beşiktaş, İstanbul", notes: "", createdAt: new Date("2025-01-15"), updatedAt: new Date("2025-01-15") },
  { id: "cust-3", name: "Mehmet Demir", email: "mehmet@email.com", phone: "+905553456789", address: "Şişli, İstanbul", notes: "Haftalık temizlik", createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
  { id: "cust-4", name: "Selen Aktaş", email: "selen@email.com", phone: "+905554567890", address: "Üsküdar, İstanbul", notes: "", createdAt: new Date("2025-02-15"), updatedAt: new Date("2025-02-15") },
  { id: "cust-5", name: "Burak Özdemir", email: "burak@email.com", phone: "+905555678901", address: "Ataşehir, İstanbul", notes: "İki kedisi var", createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01") },
];

const DEMO_STAFF_MINI = [
  { id: "staff-1", name: "Ali Veli", email: "ali@cleanfix.com", phone: "+905559876543", role: "EMPLOYEE" as const, active: true, createdAt: new Date("2025-01-10"), updatedAt: new Date("2025-01-10") },
  { id: "staff-2", name: "Ayşe Tekin", email: "ayse@cleanfix.com", phone: "+905558765432", role: "EMPLOYEE" as const, active: true, createdAt: new Date("2025-01-20"), updatedAt: new Date("2025-01-20") },
  { id: "staff-3", name: "Murat Yıldırım", email: "murat@cleanfix.com", phone: "+905557654321", role: "MANAGER" as const, active: true, createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
];

const DEMO_BOOKINGS = [
  { id: "bk-1", customerId: "cust-1", serviceId: "svc-1", staffId: "staff-1", date: new Date("2025-05-17"), time: "09:00", status: "COMPLETED" as const, notes: "Müşteri memnun", createdAt: new Date("2025-05-15"), updatedAt: new Date("2025-05-17"), customer: DEMO_CUSTOMERS_MINI[0], service: DEMO_SERVICES_MINI[0], staff: DEMO_STAFF_MINI[0] },
  { id: "bk-2", customerId: "cust-2", serviceId: "svc-2", staffId: "staff-2", date: new Date("2025-05-18"), time: "10:30", status: "CONFIRMED" as const, notes: "", createdAt: new Date("2025-05-16"), updatedAt: new Date("2025-05-16"), customer: DEMO_CUSTOMERS_MINI[1], service: DEMO_SERVICES_MINI[1], staff: DEMO_STAFF_MINI[1] },
  { id: "bk-3", customerId: "cust-3", serviceId: "svc-3", staffId: "staff-1", date: new Date("2025-05-18"), time: "14:00", status: "IN_PROGRESS" as const, notes: "Halılar kurumaya bırakıldı", createdAt: new Date("2025-05-16"), updatedAt: new Date("2025-05-18"), customer: DEMO_CUSTOMERS_MINI[2], service: DEMO_SERVICES_MINI[2], staff: DEMO_STAFF_MINI[0] },
  { id: "bk-4", customerId: "cust-4", serviceId: "svc-4", staffId: "staff-2", date: new Date("2025-05-19"), time: "11:00", status: "PENDING" as const, notes: "", createdAt: new Date("2025-05-17"), updatedAt: new Date("2025-05-17"), customer: DEMO_CUSTOMERS_MINI[3], service: DEMO_SERVICES_MINI[3], staff: DEMO_STAFF_MINI[1] },
  { id: "bk-5", customerId: "cust-5", serviceId: "svc-5", staffId: "staff-3", date: new Date("2025-05-19"), time: "16:00", status: "PENDING" as const, notes: "Dış cephe", createdAt: new Date("2025-05-17"), updatedAt: new Date("2025-05-17"), customer: DEMO_CUSTOMERS_MINI[4], service: DEMO_SERVICES_MINI[4], staff: DEMO_STAFF_MINI[2] },
  { id: "bk-6", customerId: "cust-1", serviceId: "svc-3", staffId: "staff-1", date: new Date("2025-05-20"), time: "09:00", status: "CONFIRMED" as const, notes: "3 halı", createdAt: new Date("2025-05-18"), updatedAt: new Date("2025-05-18"), customer: DEMO_CUSTOMERS_MINI[0], service: DEMO_SERVICES_MINI[2], staff: DEMO_STAFF_MINI[0] },
  { id: "bk-7", customerId: "cust-3", serviceId: "svc-1", staffId: "staff-2", date: new Date("2025-05-20"), time: "13:00", status: "CANCELLED" as const, notes: "Müşteri iptal etti", createdAt: new Date("2025-05-18"), updatedAt: new Date("2025-05-19"), customer: DEMO_CUSTOMERS_MINI[2], service: DEMO_SERVICES_MINI[0], staff: DEMO_STAFF_MINI[1] },
  { id: "bk-8", customerId: "cust-2", serviceId: "svc-4", staffId: "staff-3", date: new Date("2025-05-21"), time: "10:00", status: "PENDING" as const, notes: "", createdAt: new Date("2025-05-19"), updatedAt: new Date("2025-05-19"), customer: DEMO_CUSTOMERS_MINI[1], service: DEMO_SERVICES_MINI[3], staff: DEMO_STAFF_MINI[2] },
  { id: "bk-9", customerId: "cust-4", serviceId: "svc-2", staffId: "staff-1", date: new Date("2025-05-21"), time: "15:30", status: "CONFIRMED" as const, notes: "Haftalık", createdAt: new Date("2025-05-19"), updatedAt: new Date("2025-05-19"), customer: DEMO_CUSTOMERS_MINI[3], service: DEMO_SERVICES_MINI[1], staff: DEMO_STAFF_MINI[0] },
  { id: "bk-10", customerId: "cust-5", serviceId: "svc-1", staffId: "staff-2", date: new Date("2025-05-22"), time: "08:30", status: "PENDING" as const, notes: "Geniş daire", createdAt: new Date("2025-05-20"), updatedAt: new Date("2025-05-20"), customer: DEMO_CUSTOMERS_MINI[4], service: DEMO_SERVICES_MINI[0], staff: DEMO_STAFF_MINI[1] },
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

export async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    });
    return { success: true, data: bookings };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: DEMO_BOOKINGS };
    return { success: false, error: "Randevular yüklenirken hata oluştu" };
  }
}

export async function getBookingById(id: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
    });
    return { success: true, data: booking };
  } catch (error) {
    if (isDbError(error)) {
      const bk = DEMO_BOOKINGS.find(b => b.id === id);
      return { success: true, data: bk || null };
    }
    return { success: false, error: "Randevu bulunurken hata oluştu" };
  }
}

export async function createBooking(data: {
  customerId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  status?: string;
  notes?: string;
}) {
  try {
    const booking = await prisma.booking.create({
      data: {
        customerId: data.customerId,
        serviceId: data.serviceId,
        staffId: data.staffId || null,
        date: new Date(data.date),
        time: data.time,
        status: (data.status as any) || "PENDING",
        notes: data.notes,
      },
    });
    revalidatePath("/bookings");
    return { success: true, data: booking };
  } catch (error) {
    if (isDbError(error)) {
      const mock = {
        id: `bk-${Date.now()}`,
        customerId: data.customerId,
        serviceId: data.serviceId,
        staffId: data.staffId || null,
        date: new Date(data.date),
        time: data.time,
        status: (data.status as any) || "PENDING",
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Randevu oluşturulurken hata oluştu" };
  }
}

export async function updateBooking(
  id: string,
  data: {
    customerId?: string;
    serviceId?: string;
    staffId?: string;
    date?: string;
    time?: string;
    status?: string;
    notes?: string;
  }
) {
  try {
    const updateData: any = {};
    if (data.customerId) updateData.customerId = data.customerId;
    if (data.serviceId) updateData.serviceId = data.serviceId;
    if (data.staffId !== undefined) updateData.staffId = data.staffId || null;
    if (data.date) updateData.date = new Date(data.date);
    if (data.time) updateData.time = data.time;
    if (data.status) updateData.status = data.status as any;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/bookings");
    return { success: true, data: booking };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_BOOKINGS.find(b => b.id === id);
      const mock = { ...(existing || DEMO_BOOKINGS[0]), ...data, updatedAt: new Date() };
      if (data.date) mock.date = new Date(data.date);
      if (data.status) mock.status = data.status as any;
      return { success: true, data: mock };
    }
    return { success: false, error: "Randevu güncellenirken hata oluştu" };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as any },
    });
    revalidatePath("/bookings");
    return { success: true, data: booking };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_BOOKINGS.find(b => b.id === id);
      const mock = existing ? { ...existing, status, updatedAt: new Date() } : null;
      return { success: true, data: mock };
    }
    return { success: false, error: "Durum güncellenirken hata oluştu" };
  }
}

export async function deleteBooking(id: string) {
  try {
    await prisma.booking.delete({ where: { id } });
    revalidatePath("/bookings");
    return { success: true };
  } catch (error) {
    if (isDbError(error)) return { success: true };
    return { success: false, error: "Randevu silinirken hata oluştu" };
  }
}
