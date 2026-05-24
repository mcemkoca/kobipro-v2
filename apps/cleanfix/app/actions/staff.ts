const demoStaff = [
  { id: "stf_1", name: "Mehmet Kaya", email: "mehmet.kaya@cleanfix.com", phone: "0533 111 22 33", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 47, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-05-20") },
  { id: "stf_2", name: "Zeynep Demir", email: "zeynep.demir@cleanfix.com", phone: "0534 222 33 44", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 38, createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-05-20") },
  { id: "stf_3", name: "Ali Can", email: "ali.can@cleanfix.com", phone: "0535 333 44 55", role: "MANAGER", active: true, displayRole: "Sorumlu", displayStatus: "Aktif", jobs: 12, createdAt: new Date("2025-11-01"), updatedAt: new Date("2026-05-20") },
  { id: "stf_4", name: "Selin Yıldız", email: "selin.yildiz@cleanfix.com", phone: "0536 444 55 66", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 31, createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-05-18") },
  { id: "stf_5", name: "Can Özkan", email: "can.ozkan@cleanfix.com", phone: "0537 555 66 77", role: "EMPLOYEE", active: false, displayRole: "Teknisyen", displayStatus: "İzinli", jobs: 0, createdAt: new Date("2026-03-01"), updatedAt: new Date("2026-05-15") },
  { id: "stf_6", name: "Elif Şen", email: "elif.sen@cleanfix.com", phone: "0538 666 77 88", role: "ADMIN", active: true, displayRole: "Yönetici", displayStatus: "Aktif", jobs: 0, createdAt: new Date("2025-08-01"), updatedAt: new Date("2026-05-20") },
  { id: "stf_7", name: "Berk Arslan", email: "berk.arslan@cleanfix.com", phone: "0539 777 88 99", role: "EMPLOYEE", active: true, displayRole: "Teknisyen", displayStatus: "Aktif", jobs: 22, createdAt: new Date("2026-04-01"), updatedAt: new Date("2026-05-19") },
  { id: "stf_8", name: "Dilara Koç", email: "dilara.koc@cleanfix.com", phone: "0540 888 99 00", role: "EMPLOYEE", active: false, displayRole: "Teknisyen", displayStatus: "Pasif", jobs: 8, createdAt: new Date("2026-02-15"), updatedAt: new Date("2026-04-30") },
];

export async function getStaff() {
  return { success: true as boolean, data: demoStaff, error: undefined as string | undefined };
}

export async function getStaffById(id: string) {
  const staff = demoStaff.find((s) => s.id === id) || null;
  return { success: true as boolean, data: staff, error: undefined as string | undefined };
}

export async function createStaff(data: {
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  jobs?: number;
}) {
  try {
    const roleMap: Record<string, string> = {
      "Teknisyen": "EMPLOYEE",
      "Sorumlu": "MANAGER",
      "Yönetici": "ADMIN",
    };
    const statusMap: Record<string, string> = {
      "Aktif": "ACTIVE",
      "İzinli": "LEAVE",
      "Pasif": "INACTIVE",
    };
    const mock = {
      id: `P-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: (roleMap[data.role] || "EMPLOYEE") as any,
      displayRole: data.role,
      status: (statusMap[data.status || "Aktif"] || "ACTIVE") as any,
      displayStatus: data.status || "Aktif",
      jobs: data.jobs || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { success: true as boolean, data: mock, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Personel oluşturulurken hata oluştu" };
  }
}

export async function updateStaff(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
    jobs?: number;
  }
) {
  try {
    const roleMap: Record<string, string> = {
      "Teknisyen": "EMPLOYEE",
      "Sorumlu": "MANAGER",
      "Yönetici": "ADMIN",
    };
    const statusMap: Record<string, string> = {
      "Aktif": "ACTIVE",
      "İzinli": "LEAVE",
      "Pasif": "INACTIVE",
    };
    const mock = {
      id,
      name: data.name || "Personel",
      email: data.email || `${Date.now()}@demo.local`,
      phone: data.phone || null,
      role: data.role ? (roleMap[data.role] || "EMPLOYEE") as any : "EMPLOYEE",
      displayRole: data.role || "Teknisyen",
      status: data.status ? (statusMap[data.status] || "ACTIVE") as any : "ACTIVE",
      displayStatus: data.status || "Aktif",
      jobs: data.jobs || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { success: true as boolean, data: mock, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Personel güncellenirken hata oluştu" };
  }
}

export async function toggleStaffStatus(id: string) {
  const staff = demoStaff.find((s) => s.id === id);
  if (!staff) return { success: false as boolean, data: undefined as any, error: "Personel bulunamadı" };
  return { success: true as boolean, data: { ...staff, active: !staff.active }, error: undefined as string | undefined };
}

export async function deleteStaff(id: string) {
  try {
    return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Personel silinirken hata oluştu" };
  }
}
