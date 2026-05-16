"use server";

import { prisma } from "@kobipro/db";
import { revalidatePath } from "next/cache";

// Demo data fallback when database is unavailable
const DEMO_STAFF = [
  {
    id: "P-01",
    name: "Ali Korkmaz",
    email: "ali@cleanfix.com",
    phone: "+905321112233",
    role: "EMPLOYEE" as const,
    displayRole: "Teknisyen",
    status: "ACTIVE" as const,
    displayStatus: "Aktif",
    jobs: 45,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "P-02",
    name: "Merve Toprak",
    email: "merve@cleanfix.com",
    phone: "+905332223344",
    role: "MANAGER" as const,
    displayRole: "Sorumlu",
    status: "ACTIVE" as const,
    displayStatus: "Aktif",
    jobs: 67,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "P-03",
    name: "Burak Şahin",
    email: "burak@cleanfix.com",
    phone: "+905353334455",
    role: "EMPLOYEE" as const,
    displayRole: "Teknisyen",
    status: "LEAVE" as const,
    displayStatus: "İzinli",
    jobs: 38,
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: "P-04",
    name: "Deniz Yıldız",
    email: "deniz@cleanfix.com",
    phone: "+905364445566",
    role: "EMPLOYEE" as const,
    displayRole: "Teknisyen",
    status: "ACTIVE" as const,
    displayStatus: "Aktif",
    jobs: 52,
    createdAt: new Date("2025-02-10"),
    updatedAt: new Date("2025-02-10"),
  },
  {
    id: "P-05",
    name: "Can Özdemir",
    email: "can@cleanfix.com",
    phone: "+905375556677",
    role: "ADMIN" as const,
    displayRole: "Yönetici",
    status: "ACTIVE" as const,
    displayStatus: "Aktif",
    jobs: 0,
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "P-06",
    name: "Selin Koç",
    email: "selin@cleanfix.com",
    phone: "+905386667788",
    role: "EMPLOYEE" as const,
    displayRole: "Teknisyen",
    status: "ACTIVE" as const,
    displayStatus: "Aktif",
    jobs: 41,
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-10"),
  },
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

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: staff };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: DEMO_STAFF };
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
    if (isDbError(error)) {
      const s = DEMO_STAFF.find(s => s.id === id);
      return { success: true, data: s || null };
    }
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
      const existing = DEMO_STAFF.find(s => s.id === id);
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
        ...(existing || DEMO_STAFF[0]),
        ...data,
        role: data.role ? (roleMap[data.role] || existing?.role || "EMPLOYEE") as any : (existing?.role || "EMPLOYEE"),
        displayRole: data.role || existing?.displayRole || "Teknisyen",
        status: data.status ? (statusMap[data.status] || "ACTIVE") as any : (existing?.status || "ACTIVE"),
        displayStatus: data.status || existing?.displayStatus || "Aktif",
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
      const existing = DEMO_STAFF.find(s => s.id === id);
      if (!existing) return { success: false, error: "Personel bulunamadı" };
      const newStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const mock = {
        ...existing,
        status: newStatus as any,
        displayStatus: newStatus === "ACTIVE" ? "Aktif" : "Pasif",
        updatedAt: new Date(),
      };
      return { success: true, data: mock };
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
