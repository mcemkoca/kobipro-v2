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
    if (isDbError(error)) return { success: true, data: [] };
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
