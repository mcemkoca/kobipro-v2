import { redirect } from "next/navigation";
import { getDemoUser, isAdmin } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { getAdminStats, getUsers, updateUserRole } from "../actions/admin";
import { getBookings } from "../actions/bookings";
import { getInvoices } from "../actions/invoices";
import { getCustomers } from "../actions/customers";
import { getStaff } from "../actions/staff";
import { getServices } from "../actions/services";
import {
  Shield,
  Users,
  UserCheck,
  CalendarDays,
  Receipt,
  Wrench,
  Banknote,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Settings,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@kobipro/ui";
import Link from "next/link";

/* ---------- Server Actions (bindable) ---------- */
async function handleRoleChange(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const role = formData.get("role") as string;
  if (id && role) await updateUserRole(id, role);
}

/* ---------- Helpers ---------- */
function formatCurrency(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    ADMIN: "Yönetici",
    MANAGER: "Sorumlu",
    EMPLOYEE: "Personel",
    CUSTOMER: "Müşteri",
  };
  return map[role] || role;
}

function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    MANAGER: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    EMPLOYEE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CUSTOMER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return map[role] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

/* =========================================== */
export default async function AdminPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");
  const admin = await isAdmin();
  if (!admin) {
    return (
      <DashboardLayout pageTitle="Admin Panel" breadcrumbs={[{ label: "Admin" }]} user={{ name: user.name, email: user.email, role: user.role }}>
        <div className="flex flex-col items-center justify-center py-24">
          <Shield size={48} className="text-slate-700 mb-4" />
          <h2 className="text-lg font-semibold text-slate-300 mb-1">Erişim Reddedildi</h2>
          <p className="text-sm text-slate-500">Bu sayfayı görüntüleme yetkiniz yok.</p>
        </div>
      </DashboardLayout>
    );
  }

  /* Fetch all data in parallel */
  const [statsRes, usersRes, bookingsRes, invoicesRes, customersRes, staffRes, servicesRes] = await Promise.all([
    getAdminStats(),
    getUsers(),
    getBookings(),
    getInvoices(),
    getCustomers(),
    getStaff(),
    getServices(),
  ]);

  const stats = statsRes.success && statsRes.data ? statsRes.data : { staffCount: 0, customerCount: 0, bookingCount: 0, invoiceCount: 0, serviceCount: 0 };
  const users = usersRes.success && usersRes.data ? usersRes.data : [];
  const bookings = bookingsRes.success && bookingsRes.data ? bookingsRes.data : [];
  const invoices = invoicesRes.success && invoicesRes.data ? invoicesRes.data : [];

  const totalRevenue = invoices.filter((i: any) => i.status === "PAID").reduce((sum: number, i: any) => sum + Number(i.total ?? i.amount ?? 0), 0);
  const pendingRevenue = invoices.filter((i: any) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((sum: number, i: any) => sum + Number(i.total ?? i.amount ?? 0), 0);
  const overdueCount = invoices.filter((i: any) => i.status === "OVERDUE").length;

  const activeBookings = bookings.filter((b: any) => b.status !== "COMPLETED" && b.status !== "CANCELLED").length;
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED").length;
  const cancelledBookings = bookings.filter((b: any) => b.status === "CANCELLED").length;

  const adminUsers = users.filter((u: any) => u.role === "ADMIN" || u.role === "MANAGER");
  const employeeUsers = users.filter((u: any) => u.role === "EMPLOYEE");
  const customerUsers = users.filter((u: any) => u.role === "CUSTOMER");

  /* Module cards data */
  const modules = [
    { label: "Personel", count: stats.staffCount, href: "/staff", icon: Users, color: "bg-blue-500/10 text-blue-400", desc: "Aktif personel ve roller" },
    { label: "Müşteriler", count: stats.customerCount, href: "/customers", icon: UserCheck, color: "bg-emerald-500/10 text-emerald-400", desc: "Kayıtlı müşteri hesapları" },
    { label: "Randevular", count: stats.bookingCount, href: "/bookings", icon: CalendarDays, color: "bg-amber-500/10 text-amber-400", desc: "Tüm zaman randevular" },
    { label: "Faturalar", count: stats.invoiceCount, href: "/invoices", icon: Receipt, color: "bg-rose-500/10 text-rose-400", desc: "Oluşturulan faturalar" },
    { label: "Hizmetler", count: stats.serviceCount, href: "/services", icon: Wrench, color: "bg-cyan-500/10 text-cyan-400", desc: "Sunulan hizmet paketleri" },
    { label: "Raporlar", count: "—", href: "/reports", icon: Layers, color: "bg-purple-500/10 text-purple-400", desc: "Analiz ve istatistikler" },
  ];

  return (
    <DashboardLayout pageTitle="Admin Panel" breadcrumbs={[{ label: "Admin" }]} user={{ name: user.name, email: user.email, role: user.role }}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Toplam Gelir" value={formatCurrency(totalRevenue)} icon={Banknote} iconColor="text-emerald-400" bg="bg-emerald-500/10" sub={`${invoices.filter((i: any) => i.status === "PAID").length} ödenmiş fatura`} />
        <StatCard label="Bekleyen Tahsilat" value={formatCurrency(pendingRevenue)} icon={Receipt} iconColor="text-amber-400" bg="bg-amber-500/10" sub={`${overdueCount} gecikmiş`} />
        <StatCard label="Aktif Randevu" value={activeBookings.toString()} icon={CalendarDays} iconColor="text-blue-400" bg="bg-blue-500/10" sub={`${completedBookings} tamamlandı, ${cancelledBookings} iptal`} />
        <StatCard label="Toplam Kullanıcı" value={users.length.toString()} icon={Users} iconColor="text-purple-400" bg="bg-purple-500/10" sub={`${users.length} toplam`} />
      </div>

      {/* Module Quick Access */}
      <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <Layers size={16} className="text-slate-400" />
        Modüller
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.label} href={m.href} className="group rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-lg", m.color)}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">{m.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-100">{m.count}</span>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                Yönet <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Kullanıcı Yönetimi
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{users.length} toplam</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Kullanıcı</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Kayıt Tarihi</th>
                  <th className="px-5 py-3 font-medium text-right">Etiket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white", u.role === "ADMIN" ? "bg-rose-500" : u.role === "MANAGER" ? "bg-amber-500" : u.role === "EMPLOYEE" ? "bg-blue-500" : "bg-emerald-500")}>
                          {u.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <form action={handleRoleChange} className="inline-flex">
                        <input type="hidden" name="id" value={u.id} />
                        <select name="role" defaultValue={u.role} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 cursor-pointer">
                          <option value="ADMIN">Yönetici</option>
                          <option value="MANAGER">Sorumlu</option>
                          <option value="EMPLOYEE">Personel</option>
                          <option value="CUSTOMER">Müşteri</option>
                        </select>
                      </form>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", getRoleColor(u.role))}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Role Distribution + System Status */}
        <div className="space-y-6">
          {/* Role Distribution */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Rol Dağılımı</h2>
            </div>
            <div className="p-5 space-y-4">
              <RoleBar label="Yönetici" count={adminUsers.filter((u: any) => u.role === "ADMIN").length} total={users.length} color="bg-rose-500" />
              <RoleBar label="Sorumlu" count={adminUsers.filter((u: any) => u.role === "MANAGER").length} total={users.length} color="bg-amber-500" />
              <RoleBar label="Personel" count={employeeUsers.length} total={users.length} color="bg-blue-500" />
              <RoleBar label="Müşteri" count={customerUsers.length} total={users.length} color="bg-emerald-500" />
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                Sistem Durumu
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <StatusRow label="API" status="ok" />
              <StatusRow label="Veritabanı" status="ok" />
              <StatusRow label="Kimlik Doğrulama" status="ok" />
              <StatusRow label="E-posta Servisi" status="warn" />
              <StatusRow label="Ödeme Gateway" status="ok" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-slate-200">Hızlı Erişim</h2>
            </div>
            <div className="divide-y divide-slate-800">
              <QuickLink href="/settings" label="Sistem Ayarları" icon={Settings} />
              <QuickLink href="/reports" label="Detaylı Raporlar" icon={Layers} />
              <QuickLink href="/services/new" label="Yeni Hizmet Ekle" icon={Wrench} />
              <QuickLink href="/staff/new" label="Yeni Personel Ekle" icon={Users} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({ label, value, icon: Icon, iconColor, bg, sub }: { label: string; value: string; icon: typeof Users; iconColor: string; bg: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-100 mt-2">{value}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg", bg)}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <p className="text-xs text-slate-600 mt-3">{sub}</p>
    </div>
  );
}

function RoleBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: "ok" | "warn" | "err" }) {
  const config = {
    ok: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", text: "Çalışıyor" },
    warn: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", text: "Uyarı" },
    err: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", text: "Hata" },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border", c.bg, c.color, "border-transparent")}>
        <Icon size={12} />
        {c.text}
      </span>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Settings }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors group">
      <Icon size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>
      <ArrowRight size={14} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
    </Link>
  );
}
