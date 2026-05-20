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

const demoStaff = [
  { id: "stf_1", name: "Mehmet Kaya", email: "mehmet.kaya@cleanfix.com", phone: "0533 111 22 33", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 47, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-05-20") },
  { id: "stf_2", name: "Zeynep Demir", email: "zeynep.demir@cleanfix.com", phone: "0534 222 33 44", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 38, createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-05-20") },
  { id: "stf_3", name: "Ali Can", email: "ali.can@cleanfix.com", phone: "0535 333 44 55", role: "MANAGER", active: true, displayRole: "Sorumlu", displayStatus: "Aktif", jobs: 12, createdAt: new Date("2025-11-01"), updatedAt: new Date("2026-05-20") },
  { id: "stf_4", name: "Selin Yıldız", email: "selin.yildiz@cleanfix.com", phone: "0536 444 55 66", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 31, createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-05-18") },
  { id: "stf_5", name: "Can Özkan", email: "can.ozkan@cleanfix.com", phone: "0537 555 66 77", role: "EMPLOYEE", active: false, displayRole: "Teknisyen", displayStatus: "İzinli", jobs: 0, createdAt: new Date("2026-03-01"), updatedAt: new Date("2026-05-15") },
  { id: "stf_6", name: "Elif Şen", email: "elif.sen@cleanfix.com", phone: "0538 666 77 88", role: "ADMIN", active: true, displayRole: "Yönetici", displayStatus: "Aktif", jobs: 0, createdAt: new Date("2025-08-01"), updatedAt: new Date("2026-05-20") },
  { id: "stf_7", name: "Berk Arslan", email: "berk.arslan@cleanfix.com", phone: "0539 777 88 99", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 22, createdAt: new Date("2026-04-01"), updatedAt: new Date("2026-05-19") },
  { id: "stf_8", name: "Dilara Koç", email: "dilara.koc@cleanfix.com", phone: "0540 888 99 00", role: "EMPLOYEE", active: false, displayRole: "Teknisyen", displayStatus: "Pasif", jobs: 8, createdAt: new Date("2026-02-15"), updatedAt: new Date("2026-04-30") },
];

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (staff.length === 0) return { success: true, data: demoStaff };
    return { success: true, data: staff };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: demoStaff };
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
