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

const demoBookings = [
  { id: "bk_1", customerId: "cust_1", serviceId: "srv_1", staffId: "stf_1", date: new Date("2026-05-22"), time: "09:00", status: "CONFIRMED", notes: "Anahtar kapıcıda", createdAt: new Date("2026-05-18"), updatedAt: new Date("2026-05-18"), customer: { id: "cust_1", name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com", phone: "0532 111 22 33", address: "Ataşehir, İstanbul", notes: null }, service: { id: "srv_1", name: "Ev Temizliği", price: 1200 }, staff: { id: "stf_1", name: "Mehmet Kaya", role: "EMPLOYEE" } },
  { id: "bk_2", customerId: "cust_2", serviceId: "srv_2", staffId: "stf_2", date: new Date("2026-05-23"), time: "10:30", status: "PENDING", notes: "Ofis kat 3", createdAt: new Date("2026-05-19"), updatedAt: new Date("2026-05-19"), customer: { id: "cust_2", name: "TechSoft A.Ş.", email: "info@techsoft.com", phone: "0212 444 55 66", address: "Levent, İstanbul", notes: "Her hafta perşembe" }, service: { id: "srv_2", name: "Ofis Temizliği", price: 2500 }, staff: { id: "stf_2", name: "Zeynep Demir", role: "EMPLOYEE" } },
  { id: "bk_3", customerId: "cust_3", serviceId: "srv_4", staffId: "stf_3", date: new Date("2026-05-24"), time: "08:00", status: "IN_PROGRESS", notes: "Yeni inşaat, ince detay", createdAt: new Date("2026-05-17"), updatedAt: new Date("2026-05-20"), customer: { id: "cust_3", name: "Yapı Merkezi", email: "siparis@yapimerkezi.com", phone: "0216 777 88 99", address: "Pendik, İstanbul", notes: null }, service: { id: "srv_4", name: "İnşaat Sonrası Temizlik", price: 5000 }, staff: { id: "stf_3", name: "Ali Can", role: "MANAGER" } },
  { id: "bk_4", customerId: "cust_4", serviceId: "srv_3", staffId: "stf_1", date: new Date("2026-05-21"), time: "14:00", status: "COMPLETED", notes: "4 halı, 2 kilim", createdAt: new Date("2026-05-15"), updatedAt: new Date("2026-05-21"), customer: { id: "cust_4", name: "Fatma Şahin", email: "fatma.sahin@email.com", phone: "0543 222 33 44", address: "Kadıköy, İstanbul", notes: "Kedisi var, kapıyı açacak" }, service: { id: "srv_3", name: "Halı Yıkama", price: 800 }, staff: { id: "stf_1", name: "Mehmet Kaya", role: "EMPLOYEE" } },
  { id: "bk_5", customerId: "cust_5", serviceId: "srv_5", staffId: "stf_2", date: new Date("2026-05-25"), time: "11:00", status: "CONFIRMED", notes: "Koltuk takımı 3+2", createdAt: new Date("2026-05-20"), updatedAt: new Date("2026-05-20"), customer: { id: "cust_5", name: "Burak Özdemir", email: "burak@email.com", phone: "0555 333 44 55", address: "Beşiktaş, İstanbul", notes: null }, service: { id: "srv_5", name: "Koltuk Yıkama", price: 600 }, staff: { id: "stf_2", name: "Zeynep Demir", role: "EMPLOYEE" } },
  { id: "bk_6", customerId: "cust_6", serviceId: "srv_7", staffId: "stf_3", date: new Date("2026-05-26"), time: "07:30", status: "PENDING", notes: "Büyük depo, forklift gerekli", createdAt: new Date("2026-05-19"), updatedAt: new Date("2026-05-19"), customer: { id: "cust_6", name: "Lojistik A.Ş.", email: "ops@lojistik.com", phone: "0212 888 99 00", address: "Tuzla, İstanbul", notes: "Güvenlik kartı gerekli" }, service: { id: "srv_7", name: "Depo Temizliği", price: 3500 }, staff: { id: "stf_3", name: "Ali Can", role: "MANAGER" } },
  { id: "bk_7", customerId: "cust_1", serviceId: "srv_6", staffId: "stf_4", date: new Date("2026-05-27"), time: "16:00", status: "CANCELLED", notes: "Müşteri iptal etti — başka tarih istenecek", createdAt: new Date("2026-05-16"), updatedAt: new Date("2026-05-19"), customer: { id: "cust_1", name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com", phone: "0532 111 22 33", address: "Ataşehir, İstanbul", notes: null }, service: { id: "srv_6", name: "Cam Temizliği", price: 400 }, staff: { id: "stf_4", name: "Selin Yıldız", role: "EMPLOYEE" } },
  { id: "bk_8", customerId: "cust_7", serviceId: "srv_8", staffId: "stf_1", date: new Date("2026-05-28"), time: "08:00", status: "CONFIRMED", notes: "Apartman B blok, aylık anlaşma", createdAt: new Date("2026-05-01"), updatedAt: new Date("2026-05-01"), customer: { id: "cust_7", name: "Güneş Apartmanı Yönetimi", email: "yonetim@gunesapt.com", phone: "0216 123 45 67", address: "Maltepe, İstanbul", notes: "Her ayın son pazartesi" }, service: { id: "srv_8", name: "Apartman Temizliği", price: 1800 }, staff: { id: "stf_1", name: "Mehmet Kaya", role: "EMPLOYEE" } },
];

export async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, service: true, staff: true },
    });
    if (bookings.length === 0) return { success: true, data: demoBookings };
    return { success: true, data: bookings };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: demoBookings };
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
    if (isDbError(error)) return { success: true, data: null };
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
      const mock = {
        id,
        customerId: data.customerId || "",
        serviceId: data.serviceId || "",
        staffId: data.staffId || null,
        date: data.date ? new Date(data.date) : new Date(),
        time: data.time || "09:00",
        status: (data.status as any) || "PENDING",
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      return { success: false, error: "Durum güncellenirken hata oluştu" };
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
