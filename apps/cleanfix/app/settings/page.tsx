import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/auth";
import { getCompany, getUserSettings } from "../actions/settings";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");

  const [companyRes, settingsRes] = await Promise.all([
    getCompany(),
    getUserSettings(),
  ]);

  const company = companyRes.success && companyRes.data ? companyRes.data : {
    name: "CleanFix Profesyonel Temizlik",
    description: "İstanbul ve çevresinde profesyonel ev, ofis ve endüstriyel temizlik hizmetleri. 15 yıllık deneyim, sertifikalı ekip.",
    website: "https://cleanfix.com.tr",
    phone: "+90 212 555 01 23",
    email: "info@cleanfix.com.tr",
    address: "İstiklal Cad. No:42, Kat:3, Beyoğlu/İstanbul",
    taxId: "1234567890",
    kvk: "0123456",
  };

  const settings = settingsRes.success && settingsRes.data ? settingsRes.data : {
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

  return (
    <SettingsClient
      userName={user.name}
      userEmail={user.email}
      userRole={user.role}
      company={company}
      settings={settings}
    />
  );
}
