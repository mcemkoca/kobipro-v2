import { requireAuth } from "@/app/actions/auth";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  email: string;
  service: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "DRAFT" | "CANCELLED";
  paymentMethod?: string;
  paidDate?: string;
  notes?: string;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function dateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const SERVICES = [
  "Ev Temizliği",
  "Ofis Temizliği",
  "Halı Yıkama",
  "Cam Temizliği",
  "Derinlemesine Temizlik",
  "İnşaat Sonrası Temizlik",
  "Koltuk Yıkama",
  "Fırın/Buzdolabı Temizliği",
];

const CUSTOMERS = [
  { name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com" },
  { name: "Jan De Vries", email: "jan.devries@email.com" },
  { name: "Maria Peeters", email: "maria.peeters@email.com" },
  { name: "Ahmet Kaya", email: "ahmet.kaya@email.com" },
  { name: "Sophie Dubois", email: "sophie.dubois@email.com" },
  { name: "Pieter Janssens", email: "pieter.janssens@email.com" },
  { name: "Emily Johnson", email: "emily.johnson@email.com" },
  { name: "Lars Andersen", email: "lars.andersen@email.com" },
  { name: "Fatma Şahin", email: "fatma.sahin@email.com" },
  { name: "Thomas Vermeer", email: "thomas.vermeer@email.com" },
];

export async function getInvoices() {
  const user = await requireAuth();
  if (!user) return { success: false as boolean, data: undefined as unknown as any[], error: "Unauthorized" };

  const today = todayStr();

  const invoices: Invoice[] = [
    {
      id: "inv-001", invoiceNumber: "CF-2026-001", customer: CUSTOMERS[0].name, email: CUSTOMERS[0].email, service: SERVICES[0],
      date: dateOffset(-2), dueDate: dateOffset(5), amount: 145.0, tax: 30.45, total: 175.45, status: "PAID", paymentMethod: "Kredi Kartı", paidDate: dateOffset(-1),
    },
    {
      id: "inv-002", invoiceNumber: "CF-2026-002", customer: CUSTOMERS[1].name, email: CUSTOMERS[1].email, service: SERVICES[1],
      date: dateOffset(-3), dueDate: dateOffset(4), amount: 280.0, tax: 58.8, total: 338.8, status: "PAID", paymentMethod: "Banka Havalesi", paidDate: dateOffset(-1),
    },
    {
      id: "inv-003", invoiceNumber: "CF-2026-003", customer: CUSTOMERS[2].name, email: CUSTOMERS[2].email, service: SERVICES[2],
      date: dateOffset(-1), dueDate: dateOffset(6), amount: 95.0, tax: 19.95, total: 114.95, status: "PENDING",
    },
    {
      id: "inv-004", invoiceNumber: "CF-2026-004", customer: CUSTOMERS[3].name, email: CUSTOMERS[3].email, service: SERVICES[3],
      date: dateOffset(-5), dueDate: dateOffset(2), amount: 175.0, tax: 36.75, total: 211.75, status: "OVERDUE", notes: "2. hatırlatma gönderildi",
    },
    {
      id: "inv-005", invoiceNumber: "CF-2026-005", customer: CUSTOMERS[4].name, email: CUSTOMERS[4].email, service: SERVICES[4],
      date: dateOffset(-7), dueDate: dateOffset(0), amount: 320.0, tax: 67.2, total: 387.2, status: "PENDING",
    },
    {
      id: "inv-006", invoiceNumber: "CF-2026-006", customer: CUSTOMERS[5].name, email: CUSTOMERS[5].email, service: SERVICES[5],
      date: dateOffset(-4), dueDate: dateOffset(3), amount: 450.0, tax: 94.5, total: 544.5, status: "PAID", paymentMethod: "Kredi Kartı", paidDate: dateOffset(-2),
    },
    {
      id: "inv-007", invoiceNumber: "CF-2026-007", customer: CUSTOMERS[6].name, email: CUSTOMERS[6].email, service: SERVICES[6],
      date: dateOffset(-6), dueDate: dateOffset(1), amount: 125.0, tax: 26.25, total: 151.25, status: "PAID", paymentMethod: "Nakit", paidDate: dateOffset(-5),
    },
    {
      id: "inv-008", invoiceNumber: "CF-2026-008", customer: CUSTOMERS[7].name, email: CUSTOMERS[7].email, service: SERVICES[7],
      date: dateOffset(-8), dueDate: dateOffset(-1), amount: 85.0, tax: 17.85, total: 102.85, status: "OVERDUE", notes: "Müşteri iletişime geçilecek",
    },
    {
      id: "inv-009", invoiceNumber: "CF-2026-009", customer: CUSTOMERS[8].name, email: CUSTOMERS[8].email, service: SERVICES[0],
      date: today, dueDate: dateOffset(7), amount: 165.0, tax: 34.65, total: 199.65, status: "DRAFT",
    },
    {
      id: "inv-010", invoiceNumber: "CF-2026-010", customer: CUSTOMERS[9].name, email: CUSTOMERS[9].email, service: SERVICES[2],
      date: dateOffset(-10), dueDate: dateOffset(-3), amount: 210.0, tax: 44.1, total: 254.1, status: "PAID", paymentMethod: "Banka Havalesi", paidDate: dateOffset(-4),
    },
    {
      id: "inv-011", invoiceNumber: "CF-2026-011", customer: CUSTOMERS[0].name, email: CUSTOMERS[0].email, service: SERVICES[3],
      date: dateOffset(-12), dueDate: dateOffset(-5), amount: 195.0, tax: 40.95, total: 235.95, status: "CANCELLED", notes: "Müşteri iptal etti",
    },
    {
      id: "inv-012", invoiceNumber: "CF-2026-012", customer: CUSTOMERS[3].name, email: CUSTOMERS[3].email, service: SERVICES[4],
      date: dateOffset(-9), dueDate: dateOffset(-2), amount: 290.0, tax: 60.9, total: 350.9, status: "PAID", paymentMethod: "Kredi Kartı", paidDate: dateOffset(-7),
    },
    {
      id: "inv-013", invoiceNumber: "CF-2026-013", customer: CUSTOMERS[5].name, email: CUSTOMERS[5].email, service: SERVICES[1],
      date: dateOffset(-1), dueDate: dateOffset(6), amount: 350.0, tax: 73.5, total: 423.5, status: "PENDING",
    },
    {
      id: "inv-014", invoiceNumber: "CF-2026-014", customer: CUSTOMERS[7].name, email: CUSTOMERS[7].email, service: SERVICES[5],
      date: dateOffset(-3), dueDate: dateOffset(4), amount: 520.0, tax: 109.2, total: 629.2, status: "PENDING",
    },
    {
      id: "inv-015", invoiceNumber: "CF-2026-015", customer: CUSTOMERS[2].name, email: CUSTOMERS[2].email, service: SERVICES[6],
      date: today, dueDate: dateOffset(7), amount: 110.0, tax: 23.1, total: 133.1, status: "DRAFT",
    },
  ];

  return { success: true as boolean, data: invoices as any[], error: undefined as string | undefined };
}

export async function updateInvoiceStatus(id: string, status: string) {
  const user = await requireAuth();
  if (!user) return { success: false as boolean, data: undefined as any, error: "Unauthorized" };
  return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
}

export async function createInvoice(data: any) {
  const user = await requireAuth();
  if (!user) return { success: false as boolean, data: undefined as any, error: "Unauthorized" };

  const newInvoice: Invoice = {
    id: `inv-${Math.random().toString(36).substring(2, 7)}`,
    invoiceNumber: `CF-2026-${Math.floor(Math.random() * 900 + 100)}`,
    customer: data.customer || data.customerId || "Müşteri",
    email: data.email || "",
    service: data.service || "Hizmet",
    date: data.date || new Date().toISOString().split("T")[0],
    dueDate: data.dueDate || new Date().toISOString().split("T")[0],
    amount: Number(data.amount) || Number(data.total) || 0,
    tax: Number(data.tax) || 0,
    total: Number(data.total) || Number(data.amount) || 0,
    status: data.status || "DRAFT",
    notes: data.notes || "",
  };

  return { success: true as boolean, data: newInvoice, error: undefined as string | undefined };
}

export async function updateInvoice(id: string, data: any) {
  const user = await requireAuth();
  if (!user) return { success: false as boolean, data: undefined as any, error: "Unauthorized" };
  return { success: true as boolean, data: { id, ...data }, error: undefined as string | undefined };
}

export async function deleteInvoice(id: string) {
  const user = await requireAuth();
  if (!user) return { success: false as boolean, data: undefined as any, error: "Unauthorized" };
  return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
}
