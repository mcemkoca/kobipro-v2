"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

export async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: services };
  } catch (error) {
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
    console.error("getServiceById error:", error);
    return { success: false, error: "Hizmet bulunurken hata oluştu" };
  }
}

export async function createService(data: { name: string; description?: string; price: number; duration: number }) {
  try {
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        active: true,
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

export async function toggleServiceStatus(id: string, active: boolean) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: { active },
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    console.error("toggleServiceStatus error:", error);
    return { success: false, error: "Hizmet durumu güncellenirken hata oluştu" };
  }
}

export async function toggleServiceStatus(id: string, active: boolean) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: { active },
    });
    revalidatePath("/services");
    return { success: true, data: service };
  } catch (error) {
    console.error("toggleServiceStatus error:", error);
    return { success: false, error: "Hizmet durumu güncellenirken hata oluştu" };
  }
}
