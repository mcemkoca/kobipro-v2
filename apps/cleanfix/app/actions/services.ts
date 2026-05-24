const demoServices = [
  { id: "srv_1", name: "Ev Temizliği", description: "2+1 daire temizliği — mutfak, banyo, salon, odalar", price: 1200, duration: 180, active: true, createdAt: new Date("2026-01-15") },
  { id: "srv_2", name: "Ofis Temizliği", description: "Profesyonel ofis temizliği — masa, yer, cam, banyo", price: 2500, duration: 240, active: true, createdAt: new Date("2026-01-20") },
  { id: "srv_3", name: "Halı Yıkama", description: "Derinlemesine halı yıkama — 4 halı paketi", price: 800, duration: 120, active: true, createdAt: new Date("2026-02-01") },
  { id: "srv_4", name: "İnşaat Sonrası Temizlik", description: "Yeni inşaat/renovasyon sonrası detaylı temizlik", price: 5000, duration: 480, active: true, createdAt: new Date("2026-02-10") },
  { id: "srv_5", name: "Koltuk Yıkama", description: "Kumaş/k deri koltuk temizliği — 3+2 takım", price: 600, duration: 90, active: true, createdAt: new Date("2026-02-15") },
  { id: "srv_6", name: "Cam Temizliği", description: "Dış cephe ve iç mekan cam temizliği", price: 400, duration: 60, active: true, createdAt: new Date("2026-03-01") },
  { id: "srv_7", name: "Depo Temizliği", description: "Sanayi depo ve atölye temizliği", price: 3500, duration: 360, active: true, createdAt: new Date("2026-03-05") },
  { id: "srv_8", name: "Apartman Temizliği", description: "Ortak alan, merdiven, asansör temizliği", price: 1800, duration: 180, active: true, createdAt: new Date("2026-03-10") },
];

export async function getServices() {
  return { success: true as boolean, data: demoServices, error: undefined as string | undefined };
}

export async function getServiceById(id: string) {
  const service = demoServices.find((s) => s.id === id) || null;
  return { success: true as boolean, data: service, error: undefined as string | undefined };
}

export async function createService(data: { name: string; description?: string; price: number; duration: number; active?: boolean }) {
  try {
    const service = {
      id: `srv-${Date.now()}`,
      name: data.name,
      description: data.description || null,
      price: data.price,
      duration: data.duration,
      active: data.active ?? true,
      createdAt: new Date(),
    };
    return { success: true as boolean, data: service, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Hizmet oluşturulurken hata oluştu" };
  }
}

export async function updateService(id: string, data: { name?: string; description?: string; price?: number; duration?: number; active?: boolean }) {
  try {
    const service = { ...demoServices.find((s) => s.id === id), ...data, id };
    return { success: true as boolean, data: service, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Hizmet güncellenirken hata oluştu" };
  }
}

export async function deleteService(id: string) {
  try {
    return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Hizmet silinirken hata oluştu" };
  }
}

export async function toggleServiceStatus(id: string) {
  const service = demoServices.find((s) => s.id === id);
  if (!service) return { success: false as boolean, data: undefined as any, error: "Hizmet bulunamadı" };
  return { success: true as boolean, data: { ...service, active: !service.active }, error: undefined as string | undefined };
}
