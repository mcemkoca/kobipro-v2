"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

// Demo data fallback when database is unavailable
const DEMO_SERVICES = [
  { id: "svc-1", name: "Ev Temizliği", description: "Genel ev temizliği hizmeti", price: 450, duration: 120, active: true, createdAt: new Date("2025-01-15"), updatedAt: new Date("2025-01-15") },
  { id: "svc-2", name: "Ofis Temizliği", description: "Profesyonel ofis temizliği", price: 1200, duration: 180, active: true, createdAt: new Date("2025-01-20"), updatedAt: new Date("2025-01-20") },
  { id: "svc-3", name: "Halı Yıkama", description: "Derinlemesine halı yıkama", price: 320, duration: 90, active: true, createdAt: new Date("2025-02-01"), updatedAt: new Date("2025-02-01") },
  { id: "svc-4", name: "Koltuk Yıkama", description: "Koltuk ve kanepe temizliği", price: 280, duration: 60, active: true, createdAt: new Date("2025-02-10"), updatedAt: new Date("2025-02-10") },
  { id: "svc-5", name: "Cam Temizliği", description: "İç ve dış cam temizliği", price: 180, duration: 45, active: true, createdAt: new Date("2025-03-01"), updatedAt: new Date("2025-03-01") },
  { id: "svc-6", name: "Dış Cephe Temizliği", description: "Bina dış cephe yıkama", price: 2100, duration: 240, active: false, createdAt: new Date("2025-03-15"), updatedAt: new Date("2025-03-15") },
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

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: services };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: DEMO_SERVICES };
    return { success: false, error: "Hizmetler yüklenirken hata oluştu" };
  }
}

export async function getServiceById(id: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: { bookings: true },
    });
    return { success: true, data: service };
  } catch (error) {
    if (isDbError(error)) {
      const svc = DEMO_SERVICES.find(s => s.id === id);
      return { success: true, data: svc ? { ...svc, bookings: [] } : null };
    }
    return { success: false, error: "Hizmet bulunurken hata oluştu" };
  }
}

export async function createService(data: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  active?: boolean;
}) {
  try {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration || 60,
        active: data.active ?? true,
      },
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    if (isDbError(error)) {
      const mock = {
        id: `svc-${Date.now()}`,
        ...data,
        duration: data.duration || 60,
        active: data.active ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Hizmet oluşturulurken hata oluştu" };
  }
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    duration?: number;
    active?: boolean;
  }
) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data,
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_SERVICES.find(s => s.id === id);
      const mock = { ...(existing || DEMO_SERVICES[0]), ...data, updatedAt: new Date() };
      return { success: true, data: mock };
    }
    return { success: false, error: "Hizmet güncellenirken hata oluştu" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    if (isDbError(error)) return { success: true };
    return { success: false, error: "Hizmet silinirken hata oluştu" };
  }
}

export async function toggleServiceStatus(id: string) {
  try {
    const current = await prisma.service.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Hizmet bulunamadı" };

    const service = await prisma.service.update({
      where: { id },
      data: { active: !current.active },
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    if (isDbError(error)) {
      const existing = DEMO_SERVICES.find(s => s.id === id);
      if (!existing) return { success: false, error: "Hizmet bulunamadı" };
      const mock = { ...existing, active: !existing.active, updatedAt: new Date() };
      return { success: true, data: mock };
    }
    return { success: false, error: "Durum değiştirilirken hata oluştu" };
  }
}
