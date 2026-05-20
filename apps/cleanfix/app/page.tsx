"use client";

import Link from "next/link";
import { Button } from "@kobipro/ui";
import { useState, useEffect } from "react";
import { Check, ArrowRight, Sparkles, Shield, Zap, Globe, ChevronDown } from "lucide-react";

const translations = {
  tr: {
    nav: { login: "Giriş", demo: "Demo Başlat" },
    hero: {
      badge: "KobiPro v2 — Çok Sektörlü KOBİ Platformu",
      h1: "Küçük İşletmenizi",
      h1Accent: "Dijitalleştirin",
      desc: "Temizlik, inşaat, berberlik, oto yıkama — hangi sektörde olursanız olun. KobiPro işletmenizi büyütmek için yanınızda.",
      cta1: "Ücretsiz Demo Başlat",
      cta2: "Dashboard'a Git",
    },
    sectors: {
      title: "Sektörler",
      subtitle: "İşletmenizin sektörünü seçin. Her sektöre özel modüller, fiyatlandırma ve iş akışları.",
      soon: "Yakında",
    },
    features: {
      title: "CleanFix Modülleri",
      subtitle: "Aktif sektör — tüm modüller çalışır durumda",
    },
    why: {
      title: "Neden KobiPro?",
      items: [
        { title: "7/24 Erişim", desc: "Web ve mobil'den her an ulaşın. Offline mod desteği." },
        { title: "Veri Güvenliği", desc: "SSL şifreleme, günlük yedekleme, GDPR uyumlu." },
        { title: "Anlık Raporlar", desc: "Gelir, gider, performans — tek tıkla PDF export." },
        { title: "Çoklu Dil", desc: "Türkçe, İngilizce ve Felemenkçe arayüz." },
      ],
    },
    stats: {
      title: "Rakamlarla KobiPro",
      items: [
        { value: "3", label: "Aktif Sektör" },
        { value: "6", label: "Planlanan Sektör" },
        { value: "20+", label: "Modül" },
        { value: "99.9%", label: "Uptime" },
      ],
    },
    cta: {
      title: "Hemen Başlayın",
      desc: "Demo modda giriş yapmadan tüm özellikleri keşfedin. Admin, Manager veya Customer rolü seçin.",
      button: "Demo Başlat →",
    },
    footer: "KobiPro v2 — Çok Sektörlü KOBİ Platformu",
  },
  en: {
    nav: { login: "Login", demo: "Start Demo" },
    hero: {
      badge: "KobiPro v2 — Multi-Sector SME Platform",
      h1: "Digitalize Your",
      h1Accent: "Small Business",
      desc: "Cleaning, construction, barbershop, car wash — whatever your sector. KobiPro is here to grow your business.",
      cta1: "Start Free Demo",
      cta2: "Go to Dashboard",
    },
    sectors: {
      title: "Sectors",
      subtitle: "Choose your business sector. Sector-specific modules, pricing, and workflows.",
      soon: "Coming Soon",
    },
    features: {
      title: "CleanFix Modules",
      subtitle: "Active sector — all modules operational",
    },
    why: {
      title: "Why KobiPro?",
      items: [
        { title: "24/7 Access", desc: "Access anytime from web and mobile. Offline mode support." },
        { title: "Data Security", desc: "SSL encryption, daily backups, GDPR compliant." },
        { title: "Real-time Reports", desc: "Revenue, expenses, performance — one-click PDF export." },
        { title: "Multi-language", desc: "Turkish, English, and Dutch interface." },
      ],
    },
    stats: {
      title: "KobiPro in Numbers",
      items: [
        { value: "3", label: "Active Sectors" },
        { value: "6", label: "Planned Sectors" },
        { value: "20+", label: "Modules" },
        { value: "99.9%", label: "Uptime" },
      ],
    },
    cta: {
      title: "Get Started Now",
      desc: "Explore all features in demo mode without logging in. Choose Admin, Manager, or Customer role.",
      button: "Start Demo →",
    },
    footer: "KobiPro v2 — Multi-Sector SME Platform",
  },
  nl: {
    nav: { login: "Inloggen", demo: "Demo Starten" },
    hero: {
      badge: "KobiPro v2 — Multi-Sector MKB Platform",
      h1: "Digitaliseer Uw",
      h1Accent: "Kleinbedrijf",
      desc: "Schoonmaak, bouw, kapsalon, autowas — welke sector u ook heeft. KobiPro helpt uw bedrijf groeien.",
      cta1: "Gratis Demo Starten",
      cta2: "Naar Dashboard",
    },
    sectors: {
      title: "Sectoren",
      subtitle: "Kies uw bedrijfssector. Sector-specifieke modules, prijzen en werkstromen.",
      soon: "Binnenkort",
    },
    features: {
      title: "CleanFix Modules",
      subtitle: "Actieve sector — alle modules operationeel",
    },
    why: {
      title: "Waarom KobiPro?",
      items: [
        { title: "24/7 Toegang", desc: "Altijd toegang via web en mobiel. Offline modus ondersteuning." },
        { title: "Data Veiligheid", desc: "SSL encryptie, dagelijkse backups, GDPR compliant." },
        { title: "Real-time Rapporten", desc: "Omzet, kosten, prestaties — één klik PDF export." },
        { title: "Meertalig", desc: "Turks, Engels en Nederlands interface." },
      ],
    },
    stats: {
      title: "KobiPro in Cijfers",
      items: [
        { value: "3", label: "Actieve Sectoren" },
        { value: "6", label: "Geplande Sectoren" },
        { value: "20+", label: "Modules" },
        { value: "99.9%", label: "Beschikbaarheid" },
      ],
    },
    cta: {
      title: "Begin Nu",
      desc: "Ontdek alle functies in demo-modus zonder in te loggen. Kies Admin, Manager of Customer rol.",
      button: "Demo Starten →",
    },
    footer: "KobiPro v2 — Multi-Sector MKB Platform",
  },
};

const sectors = [
  { name: "CleanFix", tagline: { tr: "Temizlik", en: "Cleaning", nl: "Schoonmaak" }, desc: { tr: "Ev, ofis, halı, inşaat sonrası temizlik", en: "Home, office, carpet, post-construction cleaning", nl: "Huis, kantoor, tapijt, na-bouw schoonmaak" }, icon: "🧹", color: "emerald", href: "/dashboard", active: true },
  { name: "BuildPro", tagline: { tr: "İnşaat & Renovasyon", en: "Construction & Renovation", nl: "Bouw & Renovatie" }, desc: { tr: "Şantiye yönetimi, malzeme takibi, iş güvenliği", en: "Site management, material tracking, safety", nl: "Werfbeheer, materiaaltracking, veiligheid" }, icon: "🏗️", color: "amber", href: "https://mcemkoca.github.io/buildpro-vercel/", active: true },
  { name: "BarberPro", tagline: { tr: "Berber & Kuaför", en: "Barber & Salon", nl: "Kapper & Salon" }, desc: { tr: "Randevu, personel, gelir takibi, müşteri sadakati", en: "Appointments, staff, revenue, loyalty", nl: "Afspraken, personeel, omzet, loyaliteit" }, icon: "💈", color: "purple", href: "https://mcemkoca.github.io/barberpro-vercel/", active: true },
  { name: "WashPro", tagline: { tr: "Oto Yıkama", en: "Car Wash", nl: "Autowas" }, desc: { tr: "Araç yıkama, detaylı temizlik, üyelik paketleri", en: "Vehicle wash, detailing, membership packages", nl: "Voertuigwas, detailing, lidmaatschap" }, icon: "🚗", color: "cyan", href: "#", active: false },
  { name: "HomePro", tagline: { tr: "Ev Hizmetleri", en: "Home Services", nl: "Huisdiensten" }, desc: { tr: "Boya, badana, marangozluk, elektrik, tesisat", en: "Painting, carpentry, electrical, plumbing", nl: "Schilderen, timmerwerk, elektrisch, loodgieter" }, icon: "🔧", color: "orange", href: "#", active: false },
  { name: "MediPro", tagline: { tr: "Klinik & Doktor", en: "Clinic & Doctor", nl: "Kliniek & Dokter" }, desc: { tr: "Hasta takibi, randevu, reçete, faturalandırma", en: "Patient tracking, appointments, prescriptions, billing", nl: "Patiënttracking, afspraken, recepten, facturering" }, icon: "🏥", color: "rose", href: "#", active: false },
];

const modules = [
  { title: { tr: "Hizmetler", en: "Services", nl: "Diensten" }, desc: { tr: "Temizlik paketlerinizi yönetin, fiyatlandırın", en: "Manage cleaning packages, set pricing", nl: "Beheer schoonmaakpakketten, stel prijzen in" }, icon: "🧹", href: "/services" },
  { title: { tr: "Randevular", en: "Bookings", nl: "Afspraken" }, desc: { tr: "Müşteri randevularını takip edin, durum güncelleyin", en: "Track customer appointments, update status", nl: "Volg klantafspraken, update status" }, icon: "📅", href: "/bookings" },
  { title: { tr: "Müşteriler", en: "Customers", nl: "Klanten" }, desc: { tr: "Müşteri veritabanınızı oluşturun", en: "Build your customer database", nl: "Bouw uw klantendatabase op" }, icon: "👥", href: "/customers" },
  { title: { tr: "Personel", en: "Staff", nl: "Personeel" }, desc: { tr: "Ekibinizi yönetin, görev atayın", en: "Manage your team, assign tasks", nl: "Beheer uw team, wijs taken toe" }, icon: "👷", href: "/staff" },
  { title: { tr: "Raporlar", en: "Reports", nl: "Rapporten" }, desc: { tr: "Gelir, randevu, performans analizleri", en: "Revenue, appointment, performance analytics", nl: "Omzet, afspraken, prestatie-analyses" }, icon: "📊", href: "/reports" },
  { title: { tr: "Faturalar", en: "Invoices", nl: "Facturen" }, desc: { tr: "Otomatik fatura oluşturma", en: "Automatic invoice generation", nl: "Automatische factuurgeneratie" }, icon: "🧾", href: "/invoices" },
];

export default function Home() {
  const [lang, setLang] = useState<"tr" | "en" | "nl">("tr");
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const colorClasses: Record<string, string> = {
    emerald: "border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400",
    amber: "border-amber-500/30 hover:border-amber-500/60 text-amber-400",
    purple: "border-purple-500/30 hover:border-purple-500/60 text-purple-400",
    cyan: "border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400",
    orange: "border-orange-500/30 hover:border-orange-500/60 text-orange-400",
    rose: "border-rose-500/30 hover:border-rose-500/60 text-rose-400",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-1">
        {(["tr", "en", "nl"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              lang === l ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-slate-950/90 backdrop-blur border-b border-slate-800" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg">KobiPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors text-sm">
              {t.nav.login}
            </Link>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-sm">
                {t.nav.demo}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            {t.hero.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            {t.hero.h1}{" "}
            <span className="text-transparent bg-clip-text bg-emerald-400">{t.hero.h1Accent}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t.hero.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-lg px-8 shadow-lg shadow-emerald-500/20">
                {t.hero.cta1}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 border-slate-700 hover:bg-slate-800">
                {t.hero.cta2}
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex justify-center">
            <ChevronDown className="w-6 h-6 text-slate-600 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.stats.items.map((stat) => (
            <div key={stat.label} className="text-center p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.sectors.title}</h2>
          <p className="text-slate-400 max-w-xl mx-auto">{t.sectors.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => {
            const color = colorClasses[sector.color];
            const base = "group p-6 bg-slate-900 border rounded-xl transition-all relative overflow-hidden hover:-translate-y-1 hover:shadow-xl";
            return sector.active ? (
              <Link
                key={sector.name}
                href={sector.href}
                target={sector.href.startsWith("http") ? "_blank" : undefined}
                className={`${base} ${color}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-4xl mb-4">{sector.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{sector.name}</h3>
                  <p className="text-sm font-medium opacity-80 mb-2">{sector.tagline[lang]}</p>
                  <p className="text-slate-400 text-sm">{sector.desc[lang]}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                    Demo <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ) : (
              <div key={sector.name} className={`${base} ${color} opacity-50 cursor-not-allowed`}>
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                  {t.sectors.soon}
                </div>
                <div className="text-4xl mb-4">{sector.icon}</div>
                <h3 className="font-bold text-xl mb-1">{sector.name}</h3>
                <p className="text-sm font-medium opacity-80 mb-2">{sector.tagline[lang]}</p>
                <p className="text-slate-400 text-sm">{sector.desc[lang]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why KobiPro */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.why.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Zap className="w-6 h-6" />, ...t.why.items[0] },
            { icon: <Shield className="w-6 h-6" />, ...t.why.items[1] },
            { icon: <Sparkles className="w-6 h-6" />, ...t.why.items[2] },
            { icon: <Globe className="w-6 h-6" />, ...t.why.items[3] },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-colors">
              <div className="text-emerald-400 mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CleanFix Modules */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🧹</span>
          <div>
            <h2 className="text-2xl font-bold">{t.features.title}</h2>
            <p className="text-slate-400 text-sm">{t.features.subtitle}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all hover:-translate-y-0.5"
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                {m.title[lang]}
              </h3>
              <p className="text-slate-400 text-sm">{m.desc[lang]}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-center mb-12">Stack</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {["Next.js 15", "Turborepo", "Prisma", "PostgreSQL", "Tailwind CSS", "shadcn/ui", "TypeScript", "Zod"].map((tech) => (
            <span key={tech} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm font-medium">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">{t.cta.desc}</p>
            <Link href="/login">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-lg px-8 shadow-lg shadow-emerald-500/20">
                {t.cta.button}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="text-slate-400 text-sm">{t.footer}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {["CleanFix", "BuildPro", "BarberPro"].map((s) => (
                <span key={s} className="text-emerald-400">{s} ✅</span>
              ))}
              {["WashPro", "HomePro", "MediPro"].map((s) => (
                <span key={s} className="text-slate-600">{s} 🔜</span>
              ))}
            </div>
          </div>
          <div className="text-center text-slate-600 text-xs mt-6">
            Built by Deuterium12{'MCK'}
          </div>
        </div>
      </footer>
    </div>
  );
}
