"use client";

import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import CompanyForm from "../components/settings/CompanyForm";
import NotificationSettings from "../components/settings/NotificationSettings";
import ThemeToggle from "../components/settings/ThemeToggle";
import { Globe, Bell, Shield, CreditCard, Palette, Eye, EyeOff } from "lucide-react";
import { cn } from "@kobipro/ui";

const settingSections = [
  {
    title: "Genel",
    items: [
      { label: "Şirket Bilgileri", description: "Firma adı, adres ve iletişim bilgileri", icon: Globe, modal: "company" },
      { label: "Bildirim Ayarları", description: "E-posta ve push bildirim tercihleri", icon: Bell, modal: "notifications" },
    ],
  },
  {
    title: "Güvenlik",
    items: [
      { label: "Şifre Değiştir", description: "Hesap şifrenizi güncelleyin", icon: Shield, modal: "password" },
      { label: "Ödeme Ayarları", description: "Banka ve fatura bilgileriniz", icon: CreditCard, modal: "payment" },
    ],
  },
  {
    title: "Görünüm",
    items: [
      { label: "Tema", description: "Açık ve koyu mod tercihi", icon: Palette, modal: "theme" },
    ],
  },
];

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!current || !newPass || newPass !== confirm) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setCurrent("");
    setNewPass("");
    setConfirm("");
  };

  return (
    <div className="space-y-4">
      {([
        { label: "Mevcut Şifre", value: current, set: setCurrent },
        { label: "Yeni Şifre", value: newPass, set: setNewPass },
        { label: "Yeni Şifre (Tekrar)", value: confirm, set: setConfirm },
      ] as const).map((field, i) => (
        <div key={i}>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{field.label}</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pr-10 text-sm text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Güncelle
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium">Güncellendi ✓</span>}
      </div>
    </div>
  );
}

function PaymentPlaceholder() {
  return (
    <div className="text-center py-6">
      <CreditCard size={32} className="mx-auto text-slate-600 mb-3" />
      <p className="text-sm text-slate-400">Ödeme ayarları yakında aktif olacak.</p>
    </div>
  );
}

interface SettingsClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function SettingsClient({ userName, userEmail, userRole }: SettingsClientProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <DashboardLayout
      pageTitle="Ayarlar"
      breadcrumbs={[{ label: "Ayarlar" }]}
      user={{ name: userName, email: userEmail, role: userRole }}
    >
      <div className="max-w-2xl">
        {settingSections.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden divide-y divide-slate-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveModal(item.modal)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Hesap</h2>
          <p className="text-xs text-slate-500 mb-4">
            {userName} · {userEmail}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
              {userRole.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <Modal open={activeModal === "company"} onClose={() => setActiveModal(null)} title="Şirket Bilgileri">
        <CompanyForm />
      </Modal>
      <Modal open={activeModal === "notifications"} onClose={() => setActiveModal(null)} title="Bildirim Ayarları">
        <NotificationSettings />
      </Modal>
      <Modal open={activeModal === "password"} onClose={() => setActiveModal(null)} title="Şifre Değiştir">
        <PasswordForm />
      </Modal>
      <Modal open={activeModal === "payment"} onClose={() => setActiveModal(null)} title="Ödeme Ayarları">
        <PaymentPlaceholder />
      </Modal>
      <Modal open={activeModal === "theme"} onClose={() => setActiveModal(null)} title="Tema">
        <ThemeToggle />
      </Modal>
    </DashboardLayout>
  );
}
