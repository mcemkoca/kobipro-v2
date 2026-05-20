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

const demoServices = [
  { id: "srv_1", name: "Ev Temizliği", description: "2+1 daire temizliği — mutfak, banyo, salon, odalar", price: 1200, duration: 180, active: true, createdAt: new Date("2026-01-15") },
  { id: "srv_2", name: "Ofis Temizliği", description: "Profesyonel ofis temizliği — masa, yer, cam, banyo", price: 2500, duration: 240, active: true, createdAt: new Date("2026-01-20") },
  { id: "srv_3", name: "Halı Yıkama", description: "Derinlemesine halı yıkama — 4 halı paketi", price: 800, duration: 120, active: true, createdAt: new Date("2026-02-01") },
  { id: "srv_4", name: "İnşaat Sonrası Temizlik", description: "Yeni inşaat/renovasyon sonrası detaylı temizlik", price: 5000, duration: 480, active: true, createdAt: new Date("2026-02-10") },
  { id: "srv_5", name: "Koltuk Yıkama", description: "Kumaş/k deri koltuk temizliği — 3+2 takım", price: 600, duration: 90, active: true, createdAt: new Date("2026-02-15") },
  { id: "srv_6", name: "Cam Temizliği", description: "Dış cephe ve iç mekan cam temizliği", price: 400, duration: 60, active: true, createdAt: new Date("2026-03-01") },
  { id: "srv_7", name: "Depo Temizliği", description: "Sanayi depo ve atölye temizliği", price: 3500, duration: 360, active: true, createdAt: new Date("2026-03-05") },
  { id: "srv_8", name: "Apartman Temizliği", description: "Ortak alan, merdiven, asansör temizliği", price: 1800, duration: 180, active: true, createdAt: new Date("2026-03-10") },
];

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (services.length === 0) return { success: true, data: demoServices };
    return { success: true, data: services };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: demoServices };
    console.error("getServices error:", error);
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
    if (isDbError(error)) return { success: true, data: null };
    console.error("getServiceById error:", error);
    return { success: false, error: "Hizmet bulunurken hata oluştu" };
  }
}

export async function createService(data: { name: string; description?: string; price: number; duration: number; active?: boolean }) {
  try {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        active: data.active ?? true,
      },
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    console.error("createService error:", error);
    return { success: false, error: "Hizmet oluşturulurken hata oluştu" };
  }
}

export async function updateService(id: string, data: { name?: string; description?: string; price?: number; duration?: number; active?: boolean }) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data,
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    console.error("updateService error:", error);
    return { success: false, error: "Hizmet güncellenirken hata oluştu" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
    return { success: true };
  } catch (error) {
    console.error("deleteService error:", error);
    return { success: false, error: "Hizmet silinirken hata oluştu" };
  }
}

export async function toggleServiceStatus(id: string) {
  try {
    const current = await prisma.service.findUnique({ where: { id }, select: { active: true } });
    if (!current) return { success: false, error: "Hizmet bulunamadı" };
    const service = await prisma.service.update({
      where: { id },
      data: { active: !current.active },
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    console.error("toggleServiceStatus error:", error);
    return { success: false, error: "Hizmet durumu güncellenirken hata oluştu" };
  }
}
