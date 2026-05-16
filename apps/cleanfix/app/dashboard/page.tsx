import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import {
  CalendarDays,
  Users,
  Banknote,
  Receipt,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@kobipro/ui";

const stats = [
  {
    title: "Toplam Randevu",
    value: "1,284",
    change: "+12%",
    changeUp: true,
    icon: CalendarDays,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    title: "Aktif Müşteri",
    value: "342",
    change: "+8%",
    changeUp: true,
    icon: Users,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    title: "Aylık Gelir",
    value: "₺48.6K",
    change: "-3%",
    changeUp: false,
    icon: Banknote,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    title: "Bekleyen Fatura",
    value: "23",
    change: "+5%",
    changeUp: true,
    icon: Receipt,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
];

const recentBookings = [
  { id: "R-1024", customer: "Ahmet Yılmaz", service: "Ev Temizliği", date: "17 May 2025", status: "Tamamlandı", amount: "₺450" },
  { id: "R-1023", customer: "Ayşe Kaya", service: "Ofis Temizliği", date: "17 May 2025", status: "Devam Ediyor", amount: "₺1,200" },
  { id: "R-1022", customer: "Mehmet Demir", service: "Halı Yıkama", date: "16 May 2025", status: "Tamamlandı", amount: "₺320" },
  { id: "R-1021", customer: "Fatma Şahin", service: "Koltuk Yıkama", date: "16 May 2025", status: "Beklemede", amount: "₺280" },
  { id: "R-1020", customer: "Ali Can", service: "Dış Cephe", date: "15 May 2025", status: "Tamamlandı", amount: "₺2,100" },
  { id: "R-1019", customer: "Zeynep Arslan", service: "Ev Temizliği", date: "15 May 2025", status: "Tamamlandı", amount: "₺500" },
  { id: "R-1018", customer: "Burak Yıldız", service: "Cam Temizliği", date: "14 May 2025", status: "İptal", amount: "₺180" },
  { id: "R-1017", customer: "Selin Koç", service: "Ofis Temizliği", date: "14 May 2025", status: "Tamamlandı", amount: "₺900" },
  { id: "R-1016", customer: "Emre Çelik", service: "Halı Yıkama", date: "13 May 2025", status: "Tamamlandı", amount: "₺410" },
  { id: "R-1015", customer: "Deniz Akın", service: "Ev Temizliği", date: "13 May 2025", status: "Devam Ediyor", amount: "₺550" },
];

const statusStyles: Record<string, string> = {
  "Tamamlandı": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Devam Ediyor": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Beklemede": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "İptal": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();
  const userName = user.firstName || user.username || user.emailAddresses[0]?.emailAddress || "User";

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      user={{
        name: userName,
        email: user.emailAddresses[0]?.emailAddress || "",
        role: role,
      }}
    >
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm">
          Hoş geldiniz, {userName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-100 mt-2">{stat.value}</p>
                </div>
                <div className={cn("p-2.5 rounded-lg", stat.iconBg)}>
                  <Icon size={20} className={stat.iconColor} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                {stat.changeUp ? (
                  <TrendingUp size={14} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={14} className="text-rose-400" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    stat.changeUp ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-slate-600">son 30 gün</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href="/bookings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Yeni Randevu
        </a>
        <a
          href="/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
        >
          <Users size={16} />
          Yeni Müşteri
        </a>
        <a
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium transition-colors"
        >
          <Receipt size={16} />
          Yeni Fatura
        </a>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">Son Randevular</h2>
            <a
              href="/bookings"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Tümünü gör
              <ArrowRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Müşteri</th>
                  <th className="px-5 py-3 font-medium">Hizmet</th>
                  <th className="px-5 py-3 font-medium">Tarih</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                      {booking.id}
                    </td>
                    <td className="px-5 py-3 text-slate-200 font-medium">
                      {booking.customer}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {booking.service}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {booking.date}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
                          statusStyles[booking.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        )}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-200 font-medium text-right">
                      {booking.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">Gelir Özeti</h2>
            <p className="text-xs text-slate-500 mt-0.5">Son 6 ay</p>
          </div>
          <div className="p-5">
            {/* Chart.js placeholder */}
            <div className="h-48 flex items-end justify-between gap-2">
              {[
                { month: "Ara", value: 65 },
                { month: "Oca", value: 72 },
                { month: "Şub", value: 58 },
                { month: "Mar", value: 84 },
                { month: "Nis", value: 91 },
                { month: "May", value: 78 },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-36">
                    <div
                      className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ height: `${bar.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{bar.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Toplam</p>
                <p className="text-lg font-bold text-slate-100">₺286.5K</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs">
                <TrendingUp size={14} />
                <span className="font-medium">+14%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
