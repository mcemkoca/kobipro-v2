"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Wrench,
  UserCircle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@kobipro/ui";

const allNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "CUSTOMER", "TECHNICIAN"] },
  { name: "Randevular", href: "/bookings", icon: CalendarDays, roles: ["ADMIN", "MANAGER", "CUSTOMER", "TECHNICIAN"] },
  { name: "Müşteriler", href: "/customers", icon: Users, roles: ["ADMIN", "MANAGER", "CUSTOMER", "TECHNICIAN"] },
  { name: "Hizmetler", href: "/services", icon: Wrench, roles: ["ADMIN", "MANAGER", "CUSTOMER", "TECHNICIAN"] },
  { name: "Personel", href: "/staff", icon: UserCircle, roles: ["ADMIN", "MANAGER", "TECHNICIAN"] },
  { name: "Faturalar", href: "/invoices", icon: FileText, roles: ["ADMIN", "MANAGER"] },
  { name: "Raporlar", href: "/reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { name: "Ayarlar", href: "/settings", icon: Settings, roles: ["ADMIN", "MANAGER", "CUSTOMER", "TECHNICIAN"] },
];

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ user, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = allNavItems.filter((item) => {
    const currentRole = user?.role ?? "ADMIN";
    return item.roles.includes(currentRole);
  });

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[280px] flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--sidebar-border)] shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            CleanFix
          </span>
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)]"
                    : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active-bg)]/60 hover:text-[var(--sidebar-text-active)]"
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-blue-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight
                    size={14}
                    className="ml-auto text-blue-400 opacity-60"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="shrink-0 border-t border-[var(--sidebar-border)] p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-semibold text-white border border-slate-600">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role || "Member"}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <LogOut size={16} />
            <span>Çıkış</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
