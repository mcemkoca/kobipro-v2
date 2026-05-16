"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@kobipro/ui";

interface HeaderProps {
  pageTitle: string;
  onMenuToggle?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Header({ pageTitle, onMenuToggle, breadcrumbs }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

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

        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-tight">
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
      </div>
    </header>
  );
}
