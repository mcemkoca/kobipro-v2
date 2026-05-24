import { requireAuth } from "@/app/actions/auth";

const SERVICES = [
  "Ev Temizliği",
  "Ofis Temizliği",
  "Halı Yıkama",
  "Cam Temizliği",
  "Derinlemesine Temizlik",
  "İnşaat Sonrası",
  "Koltuk Yıkama",
  "Fırın Temizliği",
];

const CUSTOMERS = [
  { name: "Ayşe Yılmaz", address: "Leuven, Martelarenlaan 12" },
  { name: "Jan De Vries", address: "Brugge, Kerkstraat 45" },
  { name: "Maria Peeters", address: "Antwerp, Groenplaats 8" },
  { name: "Ahmet Kaya", address: "Ghent, Veldstraat 22" },
  { name: "Sophie Dubois", address: "Brussels, Rue Neuve 101" },
  { name: "Pieter Janssens", address: "Hasselt, Kempische Steenweg 7" },
  { name: "Emily Johnson", address: "Leuven, Naamsestraat 55" },
  { name: "Lars Andersen", address: "Bruges, Dijver 3" },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function dateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export interface EmployeeTask {
  id: string;
  service: string;
  customer: string;
  address: string;
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

export interface DaySchedule {
  dayName: string;
  shortName: string;
  date: string;
  tasks: number;
  totalHours: number;
  isToday: boolean;
}

export interface PerformanceStats {
  thisMonthCompleted: number;
  lastMonthCompleted: number;
  totalCompleted: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  efficiencyPercent: number;
  weeklyHours: number;
  monthlyRevenue: number;
}

export async function getEmployeeDashboard() {
  const user = await requireAuth();
  if (!user) return null;

  const today = todayStr();

  const tasks: EmployeeTask[] = [
    { id: "et-001", service: "Ev Temizliği", customer: "Ayşe Yılmaz", address: "Leuven, Martelarenlaan 12", date: today, time: "09:00", status: "IN_PROGRESS", notes: "3+1 daire, 2. kat. Anahtar kapı görevlisinde." },
    { id: "et-002", service: "Halı Yıkama", customer: "Jan De Vries", address: "Brugge, Kerkstraat 45", date: today, time: "11:30", status: "PENDING", notes: "2 adet büyük halı, leke çıkarma önceliği." },
    { id: "et-003", service: "Ofis Temizliği", customer: "Maria Peeters", address: "Antwerp, Groenplaats 8", date: today, time: "14:00", status: "PENDING", notes: "Haftalık rutin, 4 ofis + mutfak + WC." },
    { id: "et-004", service: "Cam Temizliği", customer: "Sophie Dubois", address: "Brussels, Rue Neuve 101", date: today, time: "16:00", status: "PENDING", notes: "Dış cephe 3. kat, emniyet kemeri gerekli." },
    { id: "et-005", service: "Koltuk Yıkama", customer: "Ahmet Kaya", address: "Ghent, Veldstraat 22", date: dateOffset(1), time: "09:30", status: "CONFIRMED" },
    { id: "et-006", service: "Derinlemesine Temizlik", customer: "Pieter Janssens", address: "Hasselt, Kempische Steenweg 7", date: dateOffset(1), time: "13:00", status: "CONFIRMED" },
    { id: "et-007", service: "Fırın Temizliği", customer: "Emily Johnson", address: "Leuven, Naamsestraat 55", date: dateOffset(2), time: "10:00", status: "PENDING" },
    { id: "et-008", service: "İnşaat Sonrası", customer: "Lars Andersen", address: "Bruges, Dijver 3", date: dateOffset(3), time: "08:00", status: "PENDING", notes: "Büyük proje, 2 gün sürmesi bekleniyor." },
    { id: "et-009", service: "Ev Temizliği", customer: "Ayşe Yılmaz", address: "Leuven, Martelarenlaan 12", date: dateOffset(-1), time: "10:00", status: "COMPLETED" },
    { id: "et-010", service: "Halı Yıkama", customer: "Jan De Vries", address: "Brugge, Kerkstraat 45", date: dateOffset(-2), time: "14:00", status: "COMPLETED" },
    { id: "et-011", service: "Cam Temizliği", customer: "Maria Peeters", address: "Antwerp, Groenplaats 8", date: dateOffset(-2), time: "09:00", status: "CANCELLED" },
    { id: "et-012", service: "Ofis Temizliği", customer: "Sophie Dubois", address: "Brussels, Rue Neuve 101", date: dateOffset(-3), time: "15:00", status: "COMPLETED" },
    { id: "et-013", service: "Derinlemesine Temizlik", customer: "Pieter Janssens", address: "Hasselt, Kempische Steenweg 7", date: dateOffset(-4), time: "11:00", status: "COMPLETED" },
    { id: "et-014", service: "Ev Temizliği", customer: "Emily Johnson", address: "Leuven, Naamsestraat 55", date: dateOffset(-5), time: "10:00", status: "COMPLETED" },
    { id: "et-015", service: "Koltuk Yıkama", customer: "Lars Andersen", address: "Bruges, Dijver 3", date: dateOffset(-6), time: "13:00", status: "COMPLETED" },
  ];

  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const weeklySchedule: DaySchedule[] = days.map((day, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    return {
      dayName: day,
      shortName: day.slice(0, 3),
      date: dateStr,
      tasks: dayTasks.length,
      totalHours: dayTasks.length * 1.5,
      isToday: dateStr === today,
    };
  });

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = tasks.filter((t) => t.status === "PENDING").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const cancelled = tasks.filter((t) => t.status === "CANCELLED").length;
  const total = tasks.length;

  const stats: PerformanceStats = {
    thisMonthCompleted: 8,
    lastMonthCompleted: 6,
    totalCompleted: completed,
    pending,
    inProgress,
    cancelled,
    efficiencyPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    weeklyHours: weeklySchedule.reduce((s, d) => s + d.totalHours, 0),
    monthlyRevenue: 2840,
  };

  const timeSlots = Array.from({ length: 9 }, (_, i) => 9 + i);
  const todayTasks = tasks.filter((t) => t.date === today);
  const scheduleSlots = timeSlots.map((hour) => ({
    hour,
    tasks: todayTasks.filter((t) => parseInt(t.time.split(":")[0]) === hour),
  }));

  return {
    user,
    tasks,
    weeklySchedule,
    stats,
    scheduleSlots,
    todayTasks,
    notifications: [
      { id: "n-001", title: "Yeni Randevu Atandı", message: "Ayşe Yılmaz — Ev Temizliği, 09:00", time: "Bugün", type: "assignment" as const },
      { id: "n-002", title: "Randevu İptal Edildi", message: "Maria Peeters — Cam Temizliği dün iptal edildi.", time: "Dün", type: "cancel" as const },
      { id: "n-003", title: "Haftalık Rapor Hazır", message: "Bu hafta 14 görev tamamladınız. Verimlilik %87.", time: "2 saat önce", type: "system" as const },
    ],
  };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const user = await requireAuth();
  if (!user) return { success: false as boolean, data: undefined as any, error: "Unauthorized" };
  return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
}
