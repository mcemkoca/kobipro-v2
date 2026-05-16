import { redirect } from "next/navigation";
import { getDemoUser } from "@/lib/auth";
import DashboardLayout from "../components/DashboardLayout";
import { FileText, Plus, Search, Calendar, Download } from "lucide-react";
import { cn } from "@kobipro/ui";

const invoices = [
  { id: "F-1024", customer: "Ahmet Yılmaz", date: "17 May 2025", dueDate: "17 Haz 2025", amount: "₺450", status: "Ödendi" },
  { id: "F-1023", customer: "Ayşe Kaya", date: "17 May 2025", dueDate: "17 Haz 2025", amount: "₺1,200", status: "Ödenmedi" },
  { id: "F-1022", customer: "Mehmet Demir", date: "16 May 2025", dueDate: "16 Haz 2025", amount: "₺320", status: "Ödendi" },
  { id: "F-1021", customer: "Fatma Şahin", date: "16 May 2025", dueDate: "16 Haz 2025", amount: "₺280", status: "Gecikti" },
  { id: "F-1020", customer: "Ali Can", date: "15 May 2025", dueDate: "15 Haz 2025", amount: "₺2,100", status: "Ödendi" },
];

const statusStyles: Record<string, string> = {
  "Ödendi": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Ödenmedi": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Gecikti": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Taslak": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default async function InvoicesPage() {
  const user = await getDemoUser();
  if (!user) redirect("/login");

  const userName = user.name;
  const role = user.role;

  return (
    <DashboardLayout
      pageTitle="Faturalar"
      breadcrumbs={[{ label: "Faturalar" }]}
      user={{ name: userName, email: user.email, role }}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Fatura ara..."
              className={cn(
                "pl-9 pr-3 py-2 rounded-lg text-sm w-64",
                "bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600",
                "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              )}
            />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <Calendar size={16} />
            Tarih
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-sm hover:bg-slate-800 transition-colors">
            <Download size={16} />
            İndir
          </button>
          <a
            href="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Yeni Fatura
          </a>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Fatura No</th>
                <th className="px-5 py-3 font-medium">Müşteri</th>
                <th className="px-5 py-3 font-medium">Tarih</th>
                <th className="px-5 py-3 font-medium">Son Ödeme</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{invoice.id}</td>
                  <td className="px-5 py-3.5 text-slate-200 font-medium">{invoice.customer}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{invoice.date}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{invoice.dueDate}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", statusStyles[invoice.status] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-200 font-medium text-right">{invoice.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
