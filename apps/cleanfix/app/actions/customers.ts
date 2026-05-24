const demoCustomers = [
  { id: "cust_1", name: "Ayşe Yılmaz", email: "ayse.yilmaz@email.com", phone: "0532 111 22 33", address: "Ataşehir, İstanbul — Barbaros Mah. Yıldız Sok. No:12 D:5", notes: "Kedisi var, kapıyı açacak. İlk müşteri — Nisan 2026'dan beri.", createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-05-18") },
  { id: "cust_2", name: "TechSoft A.Ş.", email: "info@techsoft.com", phone: "0212 444 55 66", address: "Levent, İstanbul — Büyükdere Cad. No:108 Kat:4", notes: "Her hafta perşembe ofis temizliği. 3 yıllık anlaşma. Ödeme 15 gün vadeli.", createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-05-10") },
  { id: "cust_3", name: "Yapı Merkezi", email: "siparis@yapimerkezi.com", phone: "0216 777 88 99", address: "Pendik, İstanbul — Sabiha Gökçen Havalimanı Yakını", notes: "İnşaat sonrası temizlik için düzenli. Proje bazlı çalışıyoruz.", createdAt: new Date("2026-02-20"), updatedAt: new Date("2026-05-15") },
  { id: "cust_4", name: "Fatma Şahin", email: "fatma.sahin@email.com", phone: "0543 222 33 44", address: "Kadıköy, İstanbul — Moda Caferağa Sok. No:45 D:2", notes: "Aylık halı yıkama aboneliği. Bahar temizliği eklendi.", createdAt: new Date("2026-03-05"), updatedAt: new Date("2026-04-20") },
  { id: "cust_5", name: "Burak Özdemir", email: "burak@email.com", phone: "0555 333 44 55", address: "Beşiktaş, İstanbul — Akaretler No:23 D:7", notes: "Koltuk yıkama + bahar temizliği paketi. Tavsiye üzerine geldi.", createdAt: new Date("2026-03-20"), updatedAt: new Date("2026-05-05") },
  { id: "cust_6", name: "Lojistik A.Ş.", email: "ops@lojistik.com", phone: "0212 888 99 00", address: "Tuzla, İstanbul — Orhanlı Sanayi Bölgesi Cadde:3", notes: "Depo temizliği — 2000m². Güvenlik kartı gerekli. Haftalık rutin.", createdAt: new Date("2026-04-01"), updatedAt: new Date("2026-05-12") },
  { id: "cust_7", name: "Güneş Apartmanı Yönetimi", email: "yonetim@gunesapt.com", phone: "0216 123 45 67", address: "Maltepe, İstanbul — Güneş Mah. Bağdat Cad. No:156", notes: "Apartman B Blok — aylık anlaşma. Her ayın son pazartesi.", createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-05-01") },
  { id: "cust_8", name: "Dr. Emre Korkmaz", email: "dr.emre@klinik.com", phone: "0534 444 55 66", address: "Şişli, İstanbul — Nişantaşı Teşvikiye Cad. No:12 Kat:2", notes: "Klinik dezenfeksiyon — haftada 2 gün. Özel hijyen protokolü.", createdAt: new Date("2026-04-15"), updatedAt: new Date("2026-05-08") },
  { id: "cust_9", name: "Neslihan Aydın", email: "neslihan.aydin@email.com", phone: "0551 777 88 99", address: "Üsküdar, İstanbul — Salacak Sahil Yolu No:88 D:4", notes: "Boğaz manzaralı ev — haftalık temizlik. Yüksek beklenti.", createdAt: new Date("2026-03-10"), updatedAt: new Date("2026-05-14") },
  { id: "cust_10", name: "Kapital GYO", email: "hizmet@kapitalgyo.com", phone: "0212 999 00 11", address: "Maslak, İstanbul — Teknopark Plaza A Blok Kat:15", notes: "Ofis kompleksi — 5 kat. Günlük temizlik. Aylık faturalandırma.", createdAt: new Date("2026-02-10"), updatedAt: new Date("2026-05-01") },
];

export async function getCustomers() {
  return { success: true as boolean, data: demoCustomers, error: undefined as string | undefined };
}

export async function getCustomerById(id: string) {
  const customer = demoCustomers.find((c) => c.id === id) || null;
  return { success: true as boolean, data: customer, error: undefined as string | undefined };
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const mock = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: data.email || `${Date.now()}@demo.local`,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { success: true as boolean, data: mock, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Müşteri oluşturulurken hata oluştu" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }
) {
  try {
    const mock = {
      id,
      name: data.name || "Müşteri",
      email: data.email || `${Date.now()}@demo.local`,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { success: true as boolean, data: mock, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Müşteri güncellenirken hata oluştu" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    return { success: true as boolean, data: undefined as any, error: undefined as string | undefined };
  } catch {
    return { success: false as boolean, data: undefined as any, error: "Müşteri silinirken hata oluştu" };
  }
}
