import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { Settings, Bell, Shield, Palette, Globe, CreditCard } from "lucide-react";
import { cn } from "@kobipro/ui";

const settingSections = [
  {
    title: "Genel",
    items: [
      { label: "Şirket Bilgileri", description: "Firma adı, adres ve iletişim bilgileri", icon: Globe },
      { label: "Bildirim Ayarları", description: "E-posta ve push bildirim tercihleri", icon: Bell },
    ],
  },
  {
    title: "Güvenlik",
    items: [
      { label: "Şifre Değiştir", description: "Hesap şifrenizi güncelleyin", icon: Shield },
      { label: "Ödeme Ayarları", description: "Banka ve fatura bilgileriniz", icon: CreditCard },
    ],
  },
  {
    title: "Görünüm",
    items: [
      { label: "Tema", description: "Açık ve koyu mod tercihi", icon: Palette },
    ],
  },
];

export default async function SettingsPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");

  const userName = user.name;
  const role = user.role;

  return (
    <DashboardLayout
      pageTitle="Ayarlar"
      breadcrumbs={[{ label: "Ayarlar" }]}
      user={{ name: userName, email: user.email, role }}
    >
      <div className="max-w-2xl">
        {settingSections.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden divide-y divide-slate-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Hesap</h2>
          <p className="text-xs text-slate-500 mb-4">
            {userName} · {user.email}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
              {role}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
