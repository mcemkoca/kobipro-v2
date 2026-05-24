// Static-export compatible admin helpers
const demoUsers = [
  { id: "usr_1", name: "Elif Şen", email: "elif.sen@cleanfix.com", role: "ADMIN", createdAt: new Date("2025-08-01") },
  { id: "usr_2", name: "Ali Can", email: "ali.can@cleanfix.com", role: "MANAGER", createdAt: new Date("2025-11-01") },
  { id: "usr_3", name: "Mehmet Kaya", email: "mehmet.kaya@cleanfix.com", role: "EMPLOYEE", createdAt: new Date("2026-01-01") },
  { id: "usr_4", name: "Zeynep Demir", email: "zeynep.demir@cleanfix.com", role: "EMPLOYEE", createdAt: new Date("2026-01-15") },
  { id: "usr_5", name: "Selin Yıldız", email: "selin.yildiz@cleanfix.com", role: "EMPLOYEE", createdAt: new Date("2026-02-01") },
  { id: "usr_6", name: "Can Özkan", email: "can.ozkan@cleanfix.com", role: "EMPLOYEE", createdAt: new Date("2026-03-01") },
  { id: "usr_7", name: "Berk Arslan", email: "berk.arslan@cleanfix.com", role: "EMPLOYEE", createdAt: new Date("2026-04-01") },
  { id: "usr_8", name: "Dilara Koç", email: "dilara.koc@cleanfix.com", role: "EMPLOYEE", createdAt: new Date("2026-02-15") },
  { id: "usr_9", name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com", role: "CUSTOMER", createdAt: new Date("2026-01-15") },
  { id: "usr_10", name: "Burak Özdemir", email: "burak@email.com", role: "CUSTOMER", createdAt: new Date("2026-03-20") },
];

export async function getAdminStats() {
  return {
    success: true as boolean,
    data: {
      staffCount: 8,
      customerCount: 10,
      bookingCount: 8,
      invoiceCount: 9,
      serviceCount: 8,
    },
    error: undefined as string | undefined,
  };
}

export async function getUsers() {
  return { success: true as boolean, data: demoUsers, error: undefined as string | undefined };
}

export async function updateUserRole(id: string, role: string) {
  return { success: true as boolean, data: { id, role }, error: undefined as string | undefined };
}
