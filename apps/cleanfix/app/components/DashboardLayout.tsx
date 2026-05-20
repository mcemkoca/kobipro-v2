"use client";

import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
  breadcrumbs?: { label: string; href?: string }[];
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export default function DashboardLayout({
  children,
  pageTitle,
  breadcrumbs,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "demo_login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar user={user} mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        <Header
          pageTitle={pageTitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={breadcrumbs}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
