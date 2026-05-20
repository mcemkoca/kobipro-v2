"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import { ToastContainer } from "../components/ui/Toast";
import { useToast } from "../components/ui/useToast";
import {
  Globe, Bell, Shield, CreditCard, Palette, Eye, EyeOff,
  Languages, Building2, Save, Loader2, CheckCircle2, Moon, Sun,
} from "lucide-react";
import { cn } from "@kobipro/ui";
import { updateCompany, updateUserSettings } from "../actions/settings";

/* ───────── Types ───────── */
interface CompanyData {
  name: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  kvk: string;
}

interface UserSettingsData {
  language: string;
  timezone: string;
  currency: string;
  theme: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  dailyDigest: boolean;
}

/* ───────── Password form ───────── */
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
    setCurrent(""); setNewPass(""); setConfirm("");
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
            <input type={show ? "text" : "password"} value={field.value} onChange={(e) => field.set(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 pr-10 text-sm text-slate-200 focus:border-blue-500 focus:outline-none transition-colors" />
            <button onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          Güncelle
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Güncellendi</span>}
      </div>
    </div>
  );
}

/* ───────── Payment placeholder ───────── */
function PaymentPlaceholder() {
  return (
    <div className="text-center py-6">
      <CreditCard size={32} className="mx-auto text-slate-600 mb-3" />
      <p className="text-sm text-slate-400">Ödeme ayarları yakında aktif olacak.</p>
      <p className="text-xs text-slate-500 mt-1">Stripe ve iDEAL entegrasyonu devam ediyor.</p>
    </div>
  );
}

/* ───────── Company settings panel ───────── */
function CompanySettingsPanel({ initial, onSave }: { initial: CompanyData; onSave: (d: CompanyData) => void }) {
  const [company, setCompany] = useState<CompanyData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof CompanyData, value: string) => setCompany((c) => ({ ...c, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await updateCompany(company);
    setSaving(false);
    if (res.success) { setSaved(true); onSave(company); setTimeout(() => setSaved(false), 2000); }
  };

  const fields = [
    { key: "name" as const, label: "Şirket Adı", type: "text" },
    { key: "description" as const, label: "Açıklama", type: "text" },
    { key: "website" as const, label: "Web Sitesi", type: "url" },
    { key: "email" as const, label: "E-posta", type: "email" },
    { key: "phone" as const, label: "Telefon", type: "tel" },
    { key: "address" as const, label: "Adres", type: "text" },
    { key: "taxId" as const, label: "Vergi Numarası", type: "text" },
    { key: "kvk" as const, label: "KVK Numarası", type: "text" },
  ];

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
          <input type={f.type} value={company[f.key]} onChange={(e) => update(f.key, e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none transition-colors" />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Kaydet
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Kaydedildi</span>}
      </div>
    </div>
  );
}

/* ───────── Notification settings panel ───────── */
function NotificationSettingsPanel({ initial, onSave }: { initial: UserSettingsData; onSave: (d: UserSettingsData) => void }) {
  const [settings, setSettings] = useState<UserSettingsData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof UserSettingsData) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = async () => {
    setSaving(true);
    const res = await updateUserSettings(undefined, settings);
    setSaving(false);
    if (res.success) { setSaved(true); onSave(settings); setTimeout(() => setSaved(false), 2000); }
  };

  const items = [
    { key: "emailNotifications" as const, label: "E-posta Bildirimleri", desc: "Yeni randevu, iptal ve hatırlatmalar" },
    { key: "smsNotifications" as const, label: "SMS Bildirimleri", desc: "Kısa mesaj ile anlık bildirimler" },
    { key: "pushNotifications" as const, label: "Push Bildirimleri", desc: "Tarayıcı push bildirimleri al" },
    { key: "weeklyReport" as const, label: "Haftalık Rapor", desc: "Her pazartesi özet e-postası" },
    { key: "dailyDigest" as const, label: "Günlük Özet", desc: "Her akşam günün özeti e-postası" },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer group">
          <div>
            <p className="text-sm font-medium text-slate-200">{item.label}</p>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
          <div className="relative inline-flex h-6 w-11 shrink-0">
            <input type="checkbox" checked={settings[item.key]} onChange={() => toggle(item.key)} className="peer sr-only" />
            <span className={cn("inline-block h-6 w-11 rounded-full transition-colors", "peer-checked:bg-blue-600 bg-slate-700")} />
            <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform", settings[item.key] ? "translate-x-5" : "translate-x-0")} />
          </div>
        </label>
      ))}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Kaydet
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Kaydedildi</span>}
      </div>
    </div>
  );
}

/* ───────── Regional / locale settings panel ───────── */
function RegionalSettingsPanel({ initial, onSave }: { initial: UserSettingsData; onSave: (d: UserSettingsData) => void }) {
  const [locale, setLocale] = useState<UserSettingsData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateUserSettings(undefined, locale);
    setSaving(false);
    if (res.success) { setSaved(true); onSave(locale); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Dil</label>
        <select value={locale.language} onChange={(e) => setLocale((l) => ({ ...l, language: e.target.value }))}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none transition-colors">
          <option value="tr">Türkçe (TR)</option>
          <option value="en">English (EN)</option>
          <option value="nl">Nederlands (NL)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Saat Dilimi</label>
        <select value={locale.timezone} onChange={(e) => setLocale((l) => ({ ...l, timezone: e.target.value }))}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none transition-colors">
          <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
          <option value="Europe/Brussels">Brüksel (UTC+1/+2)</option>
          <option value="Europe/Amsterdam">Amsterdam (UTC+1/+2)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Para Birimi</label>
        <select value={locale.currency} onChange={(e) => setLocale((l) => ({ ...l, currency: e.target.value }))}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none transition-colors">
          <option value="TRY">Türk Lirası (₺)</option>
          <option value="EUR">Euro (€)</option>
        </select>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Kaydet
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Kaydedildi</span>}
      </div>
    </div>
  );
}

/* ───────── Theme toggle panel ───────── */
function ThemePanel({ initial, onSave }: { initial: UserSettingsData; onSave: (d: UserSettingsData) => void }) {
  const [theme, setTheme] = useState(initial.theme);
  const [saved, setSaved] = useState(false);

  const applyTheme = (t: string) => {
    setTheme(t);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(t);
    localStorage.setItem("cleanfix-theme", t);
  };

  const handleSave = async () => {
    const res = await updateUserSettings(undefined, { theme });
    if (res.success) { setSaved(true); onSave({ ...initial, theme }); setTimeout(() => setSaved(false), 2000); }
  };

  useEffect(() => {
    const saved = localStorage.getItem("cleanfix-theme");
    if (saved) { setTheme(saved); document.documentElement.classList.add(saved); }
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Uygulama temasını seçin. Tercihiniz tarayıcınıza kaydedilir.</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => applyTheme("dark")}
          className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            theme === "dark" ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700")}>
          <Moon size={24} className={theme === "dark" ? "text-blue-400" : "text-slate-500"} />
          <span className={cn("text-sm font-medium", theme === "dark" ? "text-blue-300" : "text-slate-400")}>Koyu Mod</span>
        </button>
        <button onClick={() => applyTheme("light")}
          className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
            theme === "light" ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-900 hover:border-slate-700")}>
          <Sun size={24} className={theme === "light" ? "text-amber-400" : "text-slate-500"} />
          <span className={cn("text-sm font-medium", theme === "light" ? "text-amber-300" : "text-slate-400")}>Açık Mod</span>
        </button>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          <Save size={14} /> Kaydet
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Kaydedildi</span>}
      </div>
    </div>
  );
}

/* ───────── Section definitions ───────── */
const settingSections = [
  {
    title: "Genel",
    items: [
      { label: "Şirket Bilgileri", description: "Firma adı, adres, web sitesi, vergi ve KVK numarası", icon: Building2, modal: "company" },
      { label: "Bildirim Ayarları", description: "E-posta, SMS ve push bildirim tercihleri", icon: Bell, modal: "notifications" },
      { label: "Bölgesel Ayarlar", description: "Dil, saat dilimi ve para birimi", icon: Globe, modal: "regional" },
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

/* ───────── Main component ───────── */
interface SettingsClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
  company: CompanyData;
  settings: UserSettingsData;
}

export default function SettingsClient({ userName, userEmail, userRole, company: initialCompany, settings: initialSettings }: SettingsClientProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [company, setCompany] = useState<CompanyData>(initialCompany);
  const [settings, setSettings] = useState<UserSettingsData>(initialSettings);

  return (
    <DashboardLayout pageTitle="Ayarlar" breadcrumbs={[{ label: "Ayarlar" }]} user={{ name: userName, email: userEmail, role: userRole }}>
      <div className="max-w-2xl">
        {settingSections.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">{section.title}</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden divide-y divide-slate-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={() => setActiveModal(item.modal)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-800/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Hesap</h2>
          <p className="text-xs text-slate-500 mb-4">{userName} · {userEmail}</p>
          <div className="flex items-center gap-2">
            <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize",
              userRole === "ADMIN" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
              userRole === "MANAGER" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              userRole === "EMPLOYEE" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}>
              {userRole.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      <Modal open={activeModal === "company"} onClose={() => setActiveModal(null)} title="Şirket Bilgileri">
        <CompanySettingsPanel initial={company} onSave={setCompany} />
      </Modal>
      <Modal open={activeModal === "notifications"} onClose={() => setActiveModal(null)} title="Bildirim Ayarları">
        <NotificationSettingsPanel initial={settings} onSave={setSettings} />
      </Modal>
      <Modal open={activeModal === "regional"} onClose={() => setActiveModal(null)} title="Bölgesel Ayarlar">
        <RegionalSettingsPanel initial={settings} onSave={setSettings} />
      </Modal>
      <Modal open={activeModal === "password"} onClose={() => setActiveModal(null)} title="Şifre Değiştir">
        <PasswordForm />
      </Modal>
      <Modal open={activeModal === "payment"} onClose={() => setActiveModal(null)} title="Ödeme Ayarları">
        <PaymentPlaceholder />
      </Modal>
      <Modal open={activeModal === "theme"} onClose={() => setActiveModal(null)} title="Tema">
        <ThemePanel initial={settings} onSave={setSettings} />
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  );
}
