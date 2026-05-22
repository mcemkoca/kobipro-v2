"use server";

import { requireAuth } from "@/app/actions/auth";

export interface AfyonCustomer {
  id: string;
  name: string;
  type: "OTEL" | "TERMAL" | "TURIZM" | "RESTORAN" | "KAMU" | "AVM" | "HAVAALANI" | "TARIHI";
  address: string;
  district: string;
  contact: string;
  email: string;
  phone: string;
  services: string[];
  lastService: string;
  revenueYTD: number; // ₺
  status: "AKTIF" | "ARALIKLI" | "YENI" | "PASIF";
  rating: number; // 1-5
  notes?: string;
}

export interface AfyonInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  service: string;
  date: string;
  amount: number; // ₺
  status: "PAID" | "PENDING" | "OVERDUE";
}

export interface AfyonStats {
  totalCustomers: number;
  activeCustomers: number;
  monthlyRevenue: number;
  ytdRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  topDistrict: string;
  avgRating: number;
}

const AFYON_CUSTOMERS: AfyonCustomer[] = [
  {
    id: "afy-001",
    name: "İkbal Thermal Hotel & Spa",
    type: "OTEL",
    address: "İhsaniye, İkbal Cad. No:3, Afyonkarahisar",
    district: "Merkez",
    contact: "Mehmet İkbal",
    email: "muhasebe@ikbalthermal.com.tr",
    phone: "0 272 214 10 10",
    services: ["Otel Genel Temizliği", "Hamam & Spa Bakımı", "Halı Yıkama", "Cam Temizliği"],
    lastService: "2026-05-20",
    revenueYTD: 485000,
    status: "AKTIF",
    rating: 5,
    notes: "Haftalık 3 defa tam otel temizliği. 240 oda.",
  },
  {
    id: "afy-002",
    name: "Oruçoğlu Thermal Resort",
    type: "TERMAL",
    address: "Gazlıgöl Yolu 15. km, Afyonkarahisar",
    district: "Gazlıgöl",
    contact: "Ayşe Oruçoğlu",
    email: "info@orucoglutermal.com",
    phone: "0 272 251 40 40",
    services: ["Termal Havuz Bakımı", "Oda Temizliği", "Koltuk Yıkama", "Derinlemesine Temizlik"],
    lastService: "2026-05-19",
    revenueYTD: 372000,
    status: "AKTIF",
    rating: 5,
    notes: "150 oda, 8 termal havuz. Günlük oda temizliği.",
  },
  {
    id: "afy-003",
    name: "Sandıklı Termal Park Hotel",
    type: "TERMAL",
    address: "Kurtuluş Mah., Sandıklı",
    district: "Sandıklı",
    contact: "Hasan Yılmaz",
    email: "rezervasyon@sandiklithermal.com",
    phone: "0 272 510 20 20",
    services: ["Otel Temizliği", "Kaplıca Bakımı", "Halı Yıkama"],
    lastService: "2026-05-18",
    revenueYTD: 198000,
    status: "AKTIF",
    rating: 4,
  },
  {
    id: "afy-004",
    name: "Zafer Havalimanı",
    type: "HAVAALANI",
    address: "Ali Çetinkaya Havalimanı, Çayırbağ",
    district: "Merkez",
    contact: "Devlet Hava Meydanları",
    email: "temizlik@zafer.dhmi.gov.tr",
    phone: "0 272 213 10 30",
    services: ["Terminal Temizliği", "Cam Temizliği", "Ofis Temizliği", "İnşaat Sonrası"],
    lastService: "2026-05-21",
    revenueYTD: 650000,
    status: "AKTIF",
    rating: 5,
    notes: "Günlük 2 vardiya terminal temizliği. Yıllık sözleşme.",
  },
  {
    id: "afy-005",
    name: "Frig Vadisi Turizm Merkezi",
    type: "TURIZM",
    address: "Emre Gölü Mevkii, İhsaniye",
    district: "İhsaniye",
    contact: "Fatma Demir",
    email: "info@frigvadisi.com",
    phone: "0 272 321 45 67",
    services: ["Turistik Tesis Temizliği", "Restoran Temizliği", "Cam Temizliği"],
    lastService: "2026-05-15",
    revenueYTD: 125000,
    status: "ARALIKLI",
    rating: 4,
    notes: "Sezonluk hizmet (Nisan-Ekim).",
  },
  {
    id: "afy-006",
    name: "Ömer Paşa Camii",
    type: "TARIHI",
    address: "Kurtuluş Mah., Ömer Paşa Camii, Merkez",
    district: "Merkez",
    contact: "Vakıflar Bölge Müdürlüğü",
    email: "afyon@vakiflar.gov.tr",
    phone: "0 272 213 56 78",
    services: ["Tarihi Eser Bakım Temizliği", "Halı Yıkama", "Derinlemesine Temizlik"],
    lastService: "2026-05-10",
    revenueYTD: 87000,
    status: "ARALIKLI",
    rating: 5,
    notes: "Aylık 1 defa özel tarihi eser bakımı. 1573 yapımı.",
  },
  {
    id: "afy-007",
    name: "Kent Park AVM",
    type: "AVM",
    address: "Ali Çetinkaya Bulvarı No:45, Merkez",
    district: "Merkez",
    contact: "Burak Şahin",
    email: "yonetim@kentparkavm.com.tr",
    phone: "0 272 222 33 44",
    services: ["AVM Genel Temizliği", "Cam Temizliği", "Ofis Temizliği", "Tuvalet Bakımı"],
    lastService: "2026-05-21",
    revenueYTD: 420000,
    status: "AKTIF",
    rating: 4,
    notes: "120 mağaza, günlük 06:00-08:00 ve 22:00-24:00 vardiyaları.",
  },
  {
    id: "afy-008",
    name: "Afyonkarahisar Belediyesi",
    type: "KAMU",
    address: "Belediye Binası, Cumhuriyet Meydanı",
    district: "Merkez",
    contact: "Nimetullah Erdoğan",
    email: "temizlik@afyon.bel.tr",
    phone: "0 272 213 70 00",
    services: ["Ofis Temizliği", "Belediye Bina Bakımı", "Cam Temizliği"],
    lastService: "2026-05-20",
    revenueYTD: 310000,
    status: "AKTIF",
    rating: 4,
    notes: "Belediye ana bina + 4 şube ofisi.",
  },
  {
    id: "afy-009",
    name: "Uyu Deresi Restaurant",
    type: "RESTORAN",
    address: "Uyu Deresi Mevkii, İhsaniye",
    district: "İhsaniye",
    contact: "Selim Korkmaz",
    email: "iletisim@uyuderesi.com",
    phone: "0 272 321 89 01",
    services: ["Restoran Temizliği", "Mutfak Derinlemesine Temizlik", "Halı Yıkama"],
    lastService: "2026-05-17",
    revenueYTD: 78000,
    status: "AKTIF",
    rating: 4,
    notes: "Haftalık 2 defa mutfak derinlemesine temizlik.",
  },
  {
    id: "afy-010",
    name: "Gazlıgöl Kaplıcaları İşletmesi",
    type: "TERMAL",
    address: "Gazlıgöl Beldesi, Afyonkarahisar",
    district: "Gazlıgöl",
    contact: "Leyla Aydın",
    email: "info@gazligol.com.tr",
    phone: "0 272 251 55 55",
    services: ["Kaplıca Havuz Bakımı", "Otel Temizliği", "Tesis Bakımı"],
    lastService: "2026-05-16",
    revenueYTD: 156000,
    status: "AKTIF",
    rating: 4,
  },
  {
    id: "afy-011",
    name: "Bolvadin Belediyesi Kültür Merkezi",
    type: "KAMU",
    address: "Atatürk Bulvarı No:12, Bolvadin",
    district: "Bolvadin",
    contact: "Recep Çetin",
    email: "kultur@bolvadin.bel.tr",
    phone: "0 272 414 10 10",
    services: ["Ofis Temizliği", "Kültür Merkezi Temizliği", "Halı Yıkama"],
    lastService: "2026-05-14",
    revenueYTD: 65000,
    status: "YENI",
    rating: 3,
    notes: "Yeni sözleşme — Mart 2026'dan beri.",
  },
  {
    id: "afy-012",
    name: "Afyon Kocatepe Üniversitesi — Meslek Yüksekokulu",
    type: "KAMU",
    address: "Ahmet Necdet Sezer Kampüsü, Merkez",
    district: "Merkez",
    contact: "Prof. Dr. Zeynep Aktaş",
    email: "temizlik@aku.edu.tr",
    phone: "0 272 218 10 10",
    services: ["Okul Temizliği", "Cam Temizliği", "Derinlemesine Temizlik"],
    lastService: "2026-05-21",
    revenueYTD: 245000,
    status: "AKTIF",
    rating: 4,
    notes: "3 fakülte binası, günlük temizlik.",
  },
];

const AFYON_INVOICES: AfyonInvoice[] = [
  { id: "afi-001", invoiceNumber: "AFY-2026-001", customerId: "afy-001", customerName: "İkbal Thermal Hotel", service: "Otel Genel Temizliği", date: "2026-05-01", amount: 28500, status: "PAID" },
  { id: "afi-002", invoiceNumber: "AFY-2026-002", customerId: "afy-001", customerName: "İkbal Thermal Hotel", service: "Hamam & Spa Bakımı", date: "2026-05-05", amount: 15200, status: "PAID" },
  { id: "afi-003", invoiceNumber: "AFY-2026-003", customerId: "afy-002", customerName: "Oruçoğlu Thermal Resort", service: "Termal Havuz Bakımı", date: "2026-05-03", amount: 22100, status: "PAID" },
  { id: "afi-004", invoiceNumber: "AFY-2026-004", customerId: "afy-004", customerName: "Zafer Havalimanı", service: "Terminal Temizliği", date: "2026-05-02", amount: 45000, status: "PENDING" },
  { id: "afi-005", invoiceNumber: "AFY-2026-005", customerId: "afy-004", customerName: "Zafer Havalimanı", service: "Ofis Temizliği", date: "2026-05-10", amount: 12500, status: "PENDING" },
  { id: "afi-006", invoiceNumber: "AFY-2026-006", customerId: "afy-007", customerName: "Kent Park AVM", service: "AVM Genel Temizliği", date: "2026-05-01", amount: 32000, status: "PAID" },
  { id: "afi-007", invoiceNumber: "AFY-2026-007", customerId: "afy-007", customerName: "Kent Park AVM", service: "Cam Temizliği", date: "2026-05-08", amount: 8500, status: "PAID" },
  { id: "afi-008", invoiceNumber: "AFY-2026-008", customerId: "afy-008", customerName: "Afyonkarahisar Belediyesi", service: "Ofis Temizliği", date: "2026-05-04", amount: 18500, status: "PENDING" },
  { id: "afi-009", invoiceNumber: "AFY-2026-009", customerId: "afy-003", customerName: "Sandıklı Termal Park", service: "Otel Temizliği", date: "2026-04-28", amount: 14500, status: "OVERDUE" },
  { id: "afi-010", invoiceNumber: "AFY-2026-010", customerId: "afy-005", customerName: "Frig Vadisi Turizm", service: "Turistik Tesis Temizliği", date: "2026-04-25", amount: 9500, status: "OVERDUE" },
  { id: "afi-011", invoiceNumber: "AFY-2026-011", customerId: "afy-012", customerName: "AKÜ Meslek Yüksekokulu", service: "Okul Temizliği", date: "2026-05-07", amount: 21000, status: "PAID" },
  { id: "afi-012", invoiceNumber: "AFY-2026-012", customerId: "afy-009", customerName: "Uyu Deresi Restaurant", service: "Restoran Temizliği", date: "2026-05-06", amount: 4200, status: "PAID" },
  { id: "afi-013", invoiceNumber: "AFY-2026-013", customerId: "afy-010", customerName: "Gazlıgöl Kaplıcaları", service: "Kaplıca Havuz Bakımı", date: "2026-05-09", amount: 12800, status: "PENDING" },
  { id: "afi-014", invoiceNumber: "AFY-2026-014", customerId: "afy-002", customerName: "Oruçoğlu Thermal Resort", service: "Koltuk Yıkama", date: "2026-05-12", amount: 6800, status: "PAID" },
  { id: "afi-015", invoiceNumber: "AFY-2026-015", customerId: "afy-011", customerName: "Bolvadin Kültür Merkezi", service: "Kültür Merkezi Temizliği", date: "2026-05-11", amount: 3500, status: "PENDING" },
];

function calculateStats(): AfyonStats {
  const active = AFYON_CUSTOMERS.filter((c) => c.status === "AKTIF").length;
  const totalRevenue = AFYON_CUSTOMERS.reduce((s, c) => s + c.revenueYTD, 0);
  const pending = AFYON_INVOICES.filter((i) => i.status === "PENDING").length;
  const overdue = AFYON_INVOICES.filter((i) => i.status === "OVERDUE").length;

  const districtCounts: Record<string, number> = {};
  AFYON_CUSTOMERS.forEach((c) => {
    districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
  });
  const topDistrict = Object.entries(districtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Merkez";

  const avgRating = AFYON_CUSTOMERS.reduce((s, c) => s + c.rating, 0) / AFYON_CUSTOMERS.length;

  // Monthly revenue ≈ YTD / 5 (May itibarıyla)
  const monthlyRevenue = totalRevenue / 5;

  return {
    totalCustomers: AFYON_CUSTOMERS.length,
    activeCustomers: active,
    monthlyRevenue,
    ytdRevenue: totalRevenue,
    pendingInvoices: pending,
    overdueInvoices: overdue,
    topDistrict,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

export async function getAfyonDashboard() {
  const user = await requireAuth();
  if (!user) return null;

  return {
    customers: AFYON_CUSTOMERS,
    invoices: AFYON_INVOICES,
    stats: calculateStats(),
  };
}
