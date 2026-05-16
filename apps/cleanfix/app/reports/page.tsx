import { redirect } from "next/navigation";
import { getDemoUser, hasRole } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { BarChart3, Calendar, TrendingUp, Users, Receipt, Wrench, Shield } from "lucide-react";

const reportCards = [
  { title: "Gelir Raporu", description: "Aylık ve yıllık gelir özeti", icon: TrendingUp, href: "#" },
  { title: "Müşteri Raporu", description: "Müşteri edinme ve kayıp analizi", icon: Users, href: "#" },
  { title: "Randevu Raporu", description: "Randevu doluluk ve iptal istatistikleri", icon: Calendar, href: "#" },
  { title: "Fatura Raporu", description: "Tahsilat ve gecikme analizi", icon: Receipt, href: "#" },
  { title: "Hizmet Raporu", description: "En çok talep edilen hizmetler", icon: Wrench, href: "#" },
  { title: "Genel Özet", description: "Tüm metriklerin bir arada görünümü", icon: BarChart3, href: "#" },
];

export default async function ReportsPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");

  const authorized = await hasRole(["ADMIN", "MANAGER"]);
  if (!authorized) {
    return (
      <DashboardLayout
        pageTitle="Raporlar"
        breadcrumbs={[{ label: "Raporlar" }]}
        user={{ name: user.name, email: user.email, role: user.role }}
      >
        <div className="flex flex-col items-center justify-center py-24">
          <Shield size={48} className="text-slate-700 mb-4" />
          <h2 className="text-lg font-semibold text-slate-300 mb-1">Erişim Reddedildi</h2>
          <p className="text-sm text-slate-500">Bu sayfayı görüntüleme yetkiniz yok.</p>
        </div>
      </DashboardLayout>
    );
  }

  const userName = user.name;
  const role = user.role;

  return (
    <DashboardLayout
      pageTitle="Raporlar"
      breadcrumbs={[{ label: "Raporlar" }]}
      user={{ name: userName, email: user.email, role }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportCards.map((report) => {
          const Icon = report.icon;
          return (
            <a
              key={report.title}
              href={report.href}
              className="group rounded-xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Icon size={24} className="text-blue-400" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-200 mb-1">{report.title}</h3>
              <p className="text-xs text-slate-500">{report.description}</p>
            </a>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
        <BarChart3 size={48} className="mx-auto text-slate-700 mb-4" />
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Detaylı raporlar yakında...</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Gelişmiş filtreleme, dışa aktarma ve grafik destekli raporlar üzerinde çalışıyoruz.
        </p>
      </div>
    </DashboardLayout>
  );
}
