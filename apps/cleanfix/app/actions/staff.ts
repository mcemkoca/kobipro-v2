"use server";

import { prisma } from "@kobipro/db";

export async function getStaff() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
    return { success: true, data: staff };
  } catch (error) {
    return { success: false, error: "Personel yüklenirken hata oluştu" };
  }
}
