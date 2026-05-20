"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Home,
  ChevronDown,
  Building2,
  Paintbrush,
  Scissors,
  Car,
  HeartPulse,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@kobipro/ui";

const GRADIENTS = [
  { from: "from-rose-500", to: "to-orange-400" },
  { from: "from-amber-500", to: "to-yellow-400" },
  { from: "from-emerald-500", to: "to-teal-400" },
  { from: "from-cyan-500", to: "to-blue-400" },
  { from: "from-blue-500", to: "to-indigo-400" },
  { from: "from-violet-500", to: "to-purple-400" },
  { from: "from-fuchsia-500", to: "to-pink-400" },
  { from: "from-lime-500", to: "to-green-400" },
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h);
}

function getGradient(str: string) {
  return GRADIENTS[hashString(str) % GRADIENTS.length];
}

function getInitials(name: string) {
  return name.split(/\s+/).map((n) => n.charAt(0)).slice(0, 2).join("").toUpperCase();
}

const sectors = [
  { name: "CleanFix", slug: "cleanfix", tag: "Temizlik", icon: Paintbrush, href: "/dashboard", color: "text-emerald-400", active: true },
  { name: "BuildPro", slug: "buildpro", tag: "İnşaat", icon: Building2, href: "https://mcemkoca.github.io/buildpro-vercel/", color: "text-amber-400", active: true },
  { name: "BarberPro", slug: "barberpro", tag: "Kuaför", icon: Scissors, href: "https://mcemkoca.github.io/barberpro-vercel/", color: "text-purple-400", active: true },
  { name: "WashPro", slug: "washpro", tag: "Oto Yıkama", icon: Car, href: "#", color: "text-cyan-400", active: false },
  { name: "MediPro", slug: "medipro", tag: "Klinik", icon: HeartPulse, href: "#", color: "text-rose-400", active: false },
];

interface HeaderProps {
  pageTitle: string;
  onMenuToggle?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export default function Header({ pageTitle, onMenuToggle, breadcrumbs, user, onLogout }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [sectorOpen, setSectorOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentSector = sectors.find(s => pathname?.startsWith(`/${s.slug}`)) || sectors[0];

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Sector Switcher */}
        <div className="relative">
          <button
            onClick={() => setSectorOpen(!sectorOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <currentSector.icon size={16} className={currentSector.color} />
            <span className="text-sm font-medium text-slate-200">{currentSector.name}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {sectorOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSectorOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/20 z-50 overflow-hidden">
                <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Sektörler
                </div>
                {sectors.map((sector) => {
                  const SectorIcon = sector.icon;
                  return sector.active ? (
                    <Link
                      key={sector.slug}
                      href={sector.href}
                      target={sector.href.startsWith("http") ? "_blank" : undefined}
                      onClick={() => setSectorOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 transition-colors",
                        currentSector.slug === sector.slug && "bg-slate-800/60"
                      )}
                    >
                      <SectorIcon size={16} className={sector.color} />
                      <div>
                        <p className="text-sm font-medium text-slate-200">{sector.name}</p>
                        <p className="text-xs text-slate-500">{sector.tag}</p>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={sector.slug}
                      className="flex items-center gap-3 px-3 py-2.5 opacity-50 cursor-not-allowed"
                    >
                      <SectorIcon size={16} className={sector.color} />
                      <div>
                        <p className="text-sm font-medium text-slate-300">{sector.name}</p>
                        <p className="text-xs text-slate-500">{sector.tag} · Yakında</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-tight truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
            {pageTitle}
          </h1>
          {/* Breadcrumb */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <a href="/dashboard" className="hover:text-slate-300 transition-colors">
                <Home size={12} className="inline mr-0.5" />
                Dashboard
              </a>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <ChevronRight size={12} />
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-slate-300 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-slate-400">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className={cn(
            "relative hidden sm:flex items-center transition-all duration-200",
            searchFocused ? "w-72" : "w-56"
          )}
        >
          <Search
            size={16}
            className="absolute left-3 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Ara..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "w-full pl-9 pr-3 py-1.5 rounded-lg text-sm",
              "bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600",
              "focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
              "transition-all duration-200"
            )}
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
        </button>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-md",
                  getGradient(user.name + user.email).from,
                  getGradient(user.name + user.email).to
                )}
              >
                {getInitials(user.name)}
              </div>
              <ChevronDown size={14} className={cn("text-slate-500 transition-transform", userMenuOpen && "rotate-180")} />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-black/20 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold shadow-md",
                          getGradient(user.name + user.email).from,
                          getGradient(user.name + user.email).to
                        )}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border mt-2",
                      user.role === "ADMIN"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : user.role === "MANAGER"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : user.role === "CUSTOMER"
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {user.role === "ADMIN" ? "Admin" : user.role === "MANAGER" ? "Yönetici" : user.role === "CUSTOMER" ? "Müşteri" : "Çalışan"}
                    </span>
                  </div>
                  <div className="p-1">
                    {user.role === "CUSTOMER" && (
                      <Link
                        href="/customer-portal"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                      >
                        <User size={16} />
                        Profilim
                      </Link>
                    )}
                    {(user.role === "EMPLOYEE" || user.role === "MANAGER" || user.role === "ADMIN") && (
                      <Link
                        href="/employee"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                      >
                        <User size={16} />
                        Profilim
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
