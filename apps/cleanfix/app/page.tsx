import Link from "next/link";
import { Button } from "@kobipro/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg">CleanFix</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
              Giriş
            </Link>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-500">
                Demo Başlat
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            KobiPro v2 — Şimdi Deneyin
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Temizlik İşletmenizi{" "}
            <span className="text-emerald-400">Dijitalleştirin</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Randevular, müşteriler, hizmetler, personel — hepsi tek platformda. 
            Küçük işletmeler için tasarlandı, büyümek için inşa edildi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-lg px-8">
                Ücretsiz Demo Başlat
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Dashboard'a Git
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Modüller</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Hizmetler", desc: "Temizlik paketlerinizi yönetin, fiyatlandırın", icon: "🧹", href: "/services" },
            { title: "Randevular", desc: "Müşteri randevularını takip edin, durum güncelleyin", icon: "📅", href: "/bookings" },
            { title: "Müşteriler", desc: "Müşteri veritabanınızı oluşturun", icon: "👥", href: "/customers" },
            { title: "Personel", desc: "Ekibinizi yönetin, görev atayın", icon: "👷", href: "/staff" },
            { title: "Raporlar", desc: "Gelir, randevu, performans analizleri", icon: "📊", href: "/reports" },
            { title: "Faturalar", desc: "Otomatik fatura oluşturma", icon: "🧾", href: "/invoices" },
          ].map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-center mb-12">Teknoloji</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["Next.js 15", "Turborepo", "Prisma", "PostgreSQL", "Tailwind CSS", "shadcn/ui"].map((tech) => (
            <span key={tech} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Demo modda giriş yapmadan tüm özellikleri keşfedin. 
            Admin, Manager veya Customer rolü seçin.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-lg px-8">
              Demo Başlat →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-slate-400 text-sm">CleanFix — KobiPro v2</span>
          </div>
          <span className="text-slate-500 text-sm">Built by Deuterium12{'MCK'}</span>
        </div>
      </footer>
    </div>
  );
}
