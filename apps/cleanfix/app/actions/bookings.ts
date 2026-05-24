const demoBookings = [
  { id: "bk_1", customer: "Ayşe Yılmaz", service: "Ev Temizliği", date: "2026-05-20", time: "09:00", status: "CONFIRMED", price: 1200, notes: "Kedisi var, kapıyı açacak." },
  { id: "bk_2", customer: "TechSoft A.Ş.", service: "Ofis Temizliği", date: "2026-05-21", time: "08:00", status: "PENDING", price: 2500, notes: "Haftalık perşembe rutini." },
  { id: "bk_3", customer: "Yapı Merkezi", service: "İnşaat Sonrası Temizlik", date: "2026-05-22", time: "10:00", status: "CONFIRMED", price: 5000, notes: "Proje bazlı, 2 gün sürecek." },
  { id: "bk_4", customer: "Fatma Şahin", service: "Halı Yıkama", date: "2026-05-23", time: "14:00", status: "PENDING", price: 800, notes: "2 adet büyük halı." },
  { id: "bk_5", customer: "Burak Özdemir", service: "Koltuk Yıkama", date: "2026-05-24", time: "11:00", status: "CONFIRMED", price: 600, notes: "3+2 takım, deri koltuk." },
  { id: "bk_6", customer: "Lojistik A.Ş.", service: "Depo Temizliği", date: "2026-05-25", time: "07:00", status: "COMPLETED", price: 3500, notes: "2000m² haftalık rutin." },
  { id: "bk_7", customer: "Güneş Apartmanı", service: "Apartman Temizliği", date: "2026-05-26", time: "08:00", status: "CANCELLED", price: 1800, notes: "B Blok aylık anlaşma." },
  { id: "bk_8", customer: "Dr. Emre Korkmaz", service: "Ev Temizliği", date: "2026-05-27", time: "13:00", status: "PENDING", price: 1200, notes: "Klinik dezenfeksiyon + ofis." },
];

export async function getBookings() {
  return { success: true as boolean, data: demoBookings, error: undefined as string | undefined };
}

export async function getBookingById(id: string) {
  const booking = demoBookings.find((b) => b.id === id) || null;
  return { success: true as boolean, data: booking, error: undefined as string | undefined };
}

export async function createBooking(data: {
  customerId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  status?: string;
  notes?: string;
}) {
  try {
    const mock = {
      id: `bk-${Date.now()}`,
      customerId: data.customerId,
      serviceId: data.serviceId,
      staffId: data.staffId || null,
      date: new Date(data.date),
      time: data.time,
      status: (data.status as any) || "PENDING",
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { success: true as boolean, data: mock, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Randevu oluşturulurken hata oluştu" };
  }
}

export async function updateBooking(
  id: string,
  data: {
    customerId?: string;
    serviceId?: string;
    staffId?: string;
    date?: string;
    time?: string;
    status?: string;
    notes?: string;
  }
) {
  try {
    const mock = {
      id,
      customerId: data.customerId || "",
      serviceId: data.serviceId || "",
      staffId: data.staffId || null,
      date: data.date ? new Date(data.date) : new Date(),
      time: data.time || "09:00",
      status: (data.status as any) || "PENDING",
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { success: true as boolean, data: mock, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Randevu güncellenirken hata oluştu" };
  }
}

export async function updateBookingStatus(id: string, status: string) {
  try {
    return { success: true as boolean, data: { id, status }, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Durum güncellenirken hata oluştu" };
  }
}

export async function deleteBooking(id: string) {
  try {
    return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Randevu silinirken hata oluştu" };
  }
}
