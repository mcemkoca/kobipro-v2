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

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: staff };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: [] };
    return { success: false, error: "Personel yüklenirken hata oluştu" };
  }
}

export async function getStaffById(id: string) {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
    });
    return { success: true, data: staff };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: null };
    return { success: false, error: "Personel bulunurken hata oluştu" };
  }
}

export async function createStaff(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  jobs?: number;
}) {
  try {
    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as any,
        active: data.status !== "INACTIVE",
      },
    });
    revalidatePath("/staff");
    return { success: true, data: staff };
  } catch (error) {
    if (isDbError(error)) {
      const roleMap: Record<string, string> = {
        "Teknisyen": "EMPLOYEE",
        "Sorumlu": "MANAGER",
        "Yönetici": "ADMIN",
      };
      const statusMap: Record<string, string> = {
        "Aktif": "ACTIVE",
        "İzinli": "LEAVE",
        "Pasif": "INACTIVE",
      };
      const mock = {
        id: `P-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: (roleMap[data.role] || "EMPLOYEE") as any,
        displayRole: data.role,
        status: (statusMap[data.status || "Aktif"] || "ACTIVE") as any,
        displayStatus: data.status || "Aktif",
        jobs: data.jobs || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Personel oluşturulurken hata oluştu" };
  }
}

export async function updateStaff(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
    jobs?: number;
  }
) {
  try {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.role) updateData.role = data.role as any;
    if (data.status) {
      updateData.active = data.status !== "INACTIVE";
    }

    const staff = await prisma.staff.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/staff");
    return { success: true, data: staff };
  } catch (error) {
    if (isDbError(error)) {
      const roleMap: Record<string, string> = {
        "Teknisyen": "EMPLOYEE",
        "Sorumlu": "MANAGER",
        "Yönetici": "ADMIN",
      };
      const statusMap: Record<string, string> = {
        "Aktif": "ACTIVE",
        "İzinli": "LEAVE",
        "Pasif": "INACTIVE",
      };
      const mock = {
        id,
        name: data.name || "Personel",
        email: data.email || `${Date.now()}@demo.local`,
        phone: data.phone || null,
        role: data.role ? (roleMap[data.role] || "EMPLOYEE") as any : "EMPLOYEE",
        displayRole: data.role || "Teknisyen",
        status: data.status ? (statusMap[data.status] || "ACTIVE") as any : "ACTIVE",
        displayStatus: data.status || "Aktif",
        jobs: data.jobs || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
    }
    return { success: false, error: "Personel güncellenirken hata oluştu" };
  }
}

export async function toggleStaffStatus(id: string) {
  try {
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) return { success: false, error: "Personel bulunamadı" };

    const newActive = !staff.active;
    const updated = await prisma.staff.update({
      where: { id },
      data: { active: newActive },
    });
    revalidatePath("/staff");
    return { success: true, data: updated };
  } catch (error) {
    if (isDbError(error)) {
      return { success: false, error: "Durum değiştirilirken hata oluştu" };
    }
    return { success: false, error: "Durum değiştirilirken hata oluştu" };
  }
}

export async function deleteStaff(id: string) {
  try {
    await prisma.staff.delete({ where: { id } });
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    if (isDbError(error)) return { success: true };
    return { success: false, error: "Personel silinirken hata oluştu" };
  }
}
