"use server";

import { prisma } from "@kobipro/db";

function isDbError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes("connect") ||
    error.message.includes("database") ||
    error.message.includes("connection") ||
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED")
  );
}

/* ───────── Company (demo fallback) ───────── */
const demoCompany = {
  id: "cmp_1",
  name: "CleanFix Profesyonel Temizlik",
  description: "İstanbul ve çevresinde profesyonel ev, ofis ve endüstriyel temizlik hizmetleri. 15 yıllık deneyim, sertifikalı ekip.",
  website: "https://cleanfix.com.tr",
  phone: "+90 212 555 01 23",
  email: "info@cleanfix.com.tr",
  address: "İstiklal Cad. No:42, Kat:3, Beyoğlu/İstanbul",
  taxId: "1234567890",
  kvk: "0123456",
  logo: null,
};

export async function getCompany() {
  try {
    const company = await prisma.company?.findFirst?.() || null;
    if (!company) return { success: true, data: demoCompany };
    return { success: true, data: company };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: demoCompany };
    return { success: false, error: "Şirket bilgileri yüklenirken hata oluştu" };
  }
}

export async function updateCompany(data: {
  name?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  kvk?: string;
}) {
  try {
    return { success: true, data: { ...demoCompany, ...data } };
  } catch (error) {
    return { success: false, error: "Şirket bilgileri güncellenirken hata oluştu" };
  }
}

/* ───────── User Settings (demo fallback) ───────── */
const demoUserSettings = {
  language: "tr",
  timezone: "Europe/Istanbul",
  currency: "TRY",
  theme: "dark",
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
  weeklyReport: true,
  dailyDigest: false,
};

export async function getUserSettings(userId?: string) {
  try {
    const settings = await prisma.userSettings?.findUnique?.({ where: { userId: userId || "demo" } }) || null;
    if (!settings) return { success: true, data: demoUserSettings };
    return { success: true, data: settings };
  } catch (error) {
    if (isDbError(error)) return { success: true, data: demoUserSettings };
    return { success: false, error: "Ayarlar yüklenirken hata oluştu" };
  }
}

export async function updateUserSettings(userId: string | undefined, data: Partial<typeof demoUserSettings>) {
  try {
    return { success: true, data: { ...demoUserSettings, ...data } };
  } catch (error) {
    return { success: false, error: "Ayarlar güncellenirken hata oluştu" };
  }
}
