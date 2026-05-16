import Link from "next/link";
import { Button } from "@kobipro/ui";

const sectors = [
  {
    name: "CleanFix",
    slug: "cleanfix",
    tagline: "Temizlik",
    desc: "Ev, ofis, halı, inşaat sonrası temizlik",
    icon: "🧹",
    color: "emerald",
    href: "/dashboard",
    active: true,
  },
  {
    name: "BuildPro",
    slug: "buildpro",
    tagline: "İnşaat & Renovasyon",
    desc: "Şantiye yönetimi, malzeme takibi, iş güvenliği",
    icon: "🏗️",
    color: "amber",
    href: "https://mcemkoca.github.io/buildpro-vercel/",
    active: true,
  },
  {
    name: "BarberPro",
    slug: "barberpro",
    tagline: "Berber & Kuaför",
    desc: "Randevu, personel, gelir takibi, müşteri sadakati",
    icon: "💈",
    color: "purple",
    href: "https://mcemkoca.github.io/barberpro-vercel/",
    active: true,
  },
  {
    name: "WashPro",
    slug: "washpro",
    tagline: "Oto Yıkama",
    desc: "Araç yıkama, detaylı temizlik, üyelik paketleri",
    icon: "🚗",
    color: "cyan",
    href: "#",
    active: false,
  },
  {
    name: "HomePro",
    slug: "homepro",
    tagline: "Ev Hizmetleri",
    desc: "Boya, badana, marangozluk, elektrik, tesisat",
    icon: "🔧",
    color: "orange",
    href: "#",
    active: false,
  },
  {
    name: "MediPro",
    slug: "medipro",
    tagline: "Klinik & Doktor",
    desc: "Hasta takibi, randevu, reçete, faturalandırma",
    icon: "🏥",
    color: "rose",
    href: "#",
    active: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg">KobiPro</span>
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
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            KobiPro v2 — Çok Sektörlü KOBİ Platformu
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Küçük İşletmenizi{" "}
            <span className="text-emerald-400">Dijitalleştirin</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Temizlik, inşaat, berberlik, oto yıkama — hangi sektörde olursanız olun.
            KobiPro işletmenizi büyütmek için yanınızda.
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

      {/* Sectors */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Sektörler</h2>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
          İşletmenizin sektörünü seçin. Her sektöre özel modüller, fiyatlandırma ve iş akışları.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => {
            const colorMap: Record<string, string> = {
              emerald: "border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400",
              amber: "border-amber-500/30 hover:border-amber-500/60 text-amber-400",
              purple: "border-purple-500/30 hover:border-purple-500/60 text-purple-400",
              cyan: "border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400",
              orange: "border-orange-500/30 hover:border-orange-500/60 text-orange-400",
              rose: "border-rose-500/30 hover:border-rose-500/60 text-rose-400",
            };
            const baseClasses = "group p-6 bg-slate-900 border rounded-xl transition-all relative overflow-hidden";
            const colorClass = colorMap[sector.color] || colorMap.emerald;
            
            return sector.active ? (
              <Link
                key={sector.slug}
                href={sector.href}
                target={sector.href.startsWith("http") ? "_blank" : undefined}
                className={`${baseClasses} ${colorClass}`}
              >
                <div className="text-4xl mb-4">{sector.icon}</div>
                <h3 className="font-bold text-xl mb-1">{sector.name}</h3>
                <p className="text-sm font-medium opacity-80 mb-2">{sector.tagline}</p>
                <p className="text-slate-400 text-sm">{sector.desc}</p>
                <div className="mt-4 inline-flex items-center text-sm font-medium">
                  Demo'ya Git →
                </div>
              </Link>
            ) : (
              <div
                key={sector.slug}
                className={`${baseClasses} ${colorClass} opacity-60 cursor-not-allowed`}
              >
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                  Yakında
                </div>
                <div className="text-4xl mb-4">{sector.icon}</div>
                <h3 className="font-bold text-xl mb-1">{sector.name}</h3>
                <p className="text-sm font-medium opacity-80 mb-2">{sector.tagline}</p>
                <p className="text-slate-400 text-sm">{sector.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Sector: CleanFix Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🧹</span>
          <div>
            <h2 className="text-2xl font-bold">CleanFix Modülleri</h2>
            <p className="text-slate-400 text-sm">Aktif sektör — tüm modüller çalışır durumda</p>
          </div>
        </div>
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
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
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
      <section className="max-w-7xl mx-auto px-6 py-16">
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="text-slate-400 text-sm">KobiPro v2 — Çok Sektörlü KOBİ Platformu</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>CleanFix ✅</span>
              <span>BuildPro ✅</span>
              <span>BarberPro ✅</span>
              <span>WashPro 🔜</span>
              <span>HomePro 🔜</span>
              <span>MediPro 🔜</span>
            </div>
          </div>
          <div className="text-center text-slate-600 text-xs mt-4">
            Built by Deuterium12{'MCK'}
          </div>
        </div>
      </footer>
    </div>
  );
}
