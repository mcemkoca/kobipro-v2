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

export async function getCompany() {
  return { success: true as boolean, data: demoCompany, error: undefined as string | undefined };
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
    return { success: true as boolean, data: { ...demoCompany, ...data }, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Şirket güncellenirken hata oluştu" };
  }
}

export async function getUserSettings(userId?: string) {
  return { success: true as boolean, data: demoUserSettings, error: undefined as string | undefined };
}

export async function updateUserSettings(userId: string | undefined, data: Partial<typeof demoUserSettings>) {
  try {
    return { success: true as boolean, data: { ...demoUserSettings, ...data }, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Ayarlar güncellenirken hata oluştu" };
  }
}
