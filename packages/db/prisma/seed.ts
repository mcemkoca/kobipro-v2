import "dotenv/config";
import { PrismaClient, BookingStatus, InvoiceStatus, PaymentMethod, PaymentStatus, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env["DATABASE_URL"] || "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. STAFF (5 members) ───
  const staffData = [
    { name: "Ayşe Yılmaz", email: "ayse.yilmaz@cleanfix.com", phone: "+90 532 111 2233", role: Role.ADMIN, active: true },
    { name: "Mehmet Kaya", email: "mehmet.kaya@cleanfix.com", phone: "+90 533 222 3344", role: Role.MANAGER, active: true },
    { name: "Elif Demir", email: "elif.demir@cleanfix.com", phone: "+90 534 333 4455", role: Role.EMPLOYEE, active: true },
    { name: "Burak Şahin", email: "burak.sahin@cleanfix.com", phone: "+90 535 444 5566", role: Role.EMPLOYEE, active: true },
    { name: "Zeynep Çelik", email: "zeynep.celik@cleanfix.com", phone: "+90 536 555 6677", role: Role.EMPLOYEE, active: false },
  ];

  const staff = await Promise.all(
    staffData.map((s) => prisma.staff.create({ data: s }))
  );
  console.log(`✅ Created ${staff.length} staff members`);

  // ─── 2. SERVICES (10 cleaning services) ───
  const servicesData = [
    { name: "Ev Temizliği", description: "Standart ev temizliği hizmeti", price: 450.00, duration: 120, active: true },
    { name: "Ofis Temizliği", description: "Profesyonel ofis temizliği", price: 600.00, duration: 180, active: true },
    { name: "Halı Yıkama", description: "Derinlemesine halı temizliği", price: 250.00, duration: 90, active: true },
    { name: "Koltuk Temizliği", description: "Kumaş ve deri koltuk temizliği", price: 300.00, duration: 60, active: true },
    { name: "Cam Temizliği", description: "İç ve dış cam temizliği", price: 200.00, duration: 90, active: true },
    { name: "İnşaat Sonrası Temizlik", description: "Yapı sonrası detaylı temizlik", price: 1200.00, duration: 360, active: true },
    { name: "Depo Temizliği", description: "Depo ve arşiv temizliği", price: 800.00, duration: 240, active: true },
    { name: "Baca Temizliği", description: "Baca ve havalandırma temizliği", price: 350.00, duration: 120, active: false },
    { name: "Bahçe Bakımı", description: "Bahçe temizliği ve bakım", price: 500.00, duration: 180, active: true },
    { name: "Dezenfeksiyon", description: "UV ve kimyasal dezenfeksiyon", price: 400.00, duration: 90, active: true },
  ];

  const services = await Promise.all(
    servicesData.map((s) => prisma.service.create({ data: s }))
  );
  console.log(`✅ Created ${services.length} services`);

  // ─── 3. CUSTOMERS (20 customers) ───
  const customerData = [
    { name: "Ali Veli", email: "ali.veli@gmail.com", phone: "+90 537 111 2233", address: "Ataşehir, İstanbul", notes: "Düzenli müşteri" },
    { name: "Fatma Aydın", email: "fatma.aydin@hotmail.com", phone: "+90 538 222 3344", address: "Kadıköy, İstanbul", notes: "" },
    { name: "Hüseyin Özdemir", email: "huseyin.ozdemir@yahoo.com", phone: "+90 539 333 4455", address: "Beşiktaş, İstanbul", notes: "Ofis temizliği talep ediyor" },
    { name: "Seda Koç", email: "seda.koc@gmail.com", phone: "+90 530 444 5566", address: "Üsküdar, İstanbul", notes: "" },
    { name: "Can Yıldız", email: "can.yildiz@outlook.com", phone: "+90 531 555 6677", address: "Maltepe, İstanbul", notes: "Kedisi var" },
    { name: "Deniz Arslan", email: "deniz.arslan@gmail.com", phone: "+90 532 666 7788", address: "Kartal, İstanbul", notes: "" },
    { name: "Ebru Kılıç", email: "ebru.kilic@hotmail.com", phone: "+90 533 777 8899", address: "Pendik, İstanbul", notes: "Haftada bir" },
    { name: "Murat Tekin", email: "murat.tekin@yahoo.com", phone: "+90 534 888 9900", address: "Şişli, İstanbul", notes: "" },
    { name: "Gizem Yılmaz", email: "gizem.yilmaz@gmail.com", phone: "+90 535 999 0011", address: "Bakırköy, İstanbul", notes: "Alerjik reaksiyon" },
    { name: "Serkan Doğan", email: "serkan.dogan@outlook.com", phone: "+90 536 000 1122", address: "Sarıyer, İstanbul", notes: "" },
    { name: "Nur Şahin", email: "nur.sahin@gmail.com", phone: "+90 537 111 3344", address: "Tuzla, İstanbul", notes: "Villa temizliği" },
    { name: "Oğuzhan Akın", email: "oguzhan.akin@hotmail.com", phone: "+90 538 222 4455", address: "Beykoz, İstanbul", notes: "" },
    { name: "Yasemin Polat", email: "yasemin.polat@yahoo.com", phone: "+90 539 333 5566", address: "Ümraniye, İstanbul", notes: "Eski bina" },
    { name: "Kemal Erdoğan", email: "kemal.erdogan@gmail.com", phone: "+90 530 444 6677", address: "Fatih, İstanbul", notes: "" },
    { name: "Büşra Çetin", email: "busra.cetin@outlook.com", phone: "+90 531 555 7788", address: "Eyüp, İstanbul", notes: "Hamile" },
    { name: "Tolga Mercan", email: "tolga.mercan@hotmail.com", phone: "+90 532 666 8899", address: "Gaziosmanpaşa, İstanbul", notes: "" },
    { name: "Selin Avcı", email: "selin.avci@gmail.com", phone: "+90 533 777 9900", address: "Beylikdüzü, İstanbul", notes: "Site içi" },
    { name: "Emre Toprak", email: "emre.toprak@yahoo.com", phone: "+90 534 888 0011", address: "Bağcılar, İstanbul", notes: "" },
    { name: "Aslı Kara", email: "asli.kara@gmail.com", phone: "+90 535 999 1122", address: "Zeytinburnu, İstanbul", notes: "Küçük apartman" },
    { name: "Barış Tan", email: "baris.tan@outlook.com", phone: "+90 536 000 2233", address: "Florya, İstanbul", notes: "" },
  ];

  const customers = await Promise.all(
    customerData.map((c) => prisma.customer.create({ data: c }))
  );
  console.log(`✅ Created ${customers.length} customers`);

  // ─── 4. BOOKINGS (30 appointments) ───
  const statuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
  const today = new Date();

  const bookingsData = Array.from({ length: 30 }, (_, i) => {
    const customer = customers[i % customers.length];
    const service = services[i % services.length];
    const staffMember = staff[i % staff.length];
    const date = new Date(today);
    date.setDate(date.getDate() + (i % 14) - 7); // spread across last week and next week
    const hours = 9 + (i % 9);
    const minutes = (i % 4) * 15;

    return {
      customerId: customer.id,
      serviceId: service.id,
      staffId: staffMember.id,
      date: date,
      time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      status: statuses[i % statuses.length],
      notes: i % 5 === 0 ? "Özel not: Lütfen sessiz çalışın" : "",
    };
  });

  const bookings = await Promise.all(
    bookingsData.map((b) => prisma.booking.create({ data: b }))
  );
  console.log(`✅ Created ${bookings.length} bookings`);

  // ─── 5. INVOICES (10 invoices) ───
  const invoiceStatuses = [InvoiceStatus.DRAFT, InvoiceStatus.SENT, InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED];

  const invoicesData = Array.from({ length: 10 }, (_, i) => {
    const customer = customers[i % customers.length];
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + (i % 30));
    const status = invoiceStatuses[i % invoiceStatuses.length];
    const paidDate = status === InvoiceStatus.PAID ? new Date(today) : null;

    return {
      customerId: customer.id,
      amount: (150 + i * 75).toFixed(2),
      status,
      dueDate,
      paidDate,
    };
  });

  const invoices = await Promise.all(
    invoicesData.map((inv) => prisma.invoice.create({ data: inv }))
  );
  console.log(`✅ Created ${invoices.length} invoices`);

  // ─── 6. PAYMENTS (linked to paid invoices) ───
  const paidInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.PAID);
  const payments = await Promise.all(
    paidInvoices.map((inv) =>
      prisma.payment.create({
        data: {
          invoiceId: inv.id,
          amount: inv.amount,
          method: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.COMPLETED,
          date: inv.paidDate || new Date(),
        },
      })
    )
  );
  console.log(`✅ Created ${payments.length} payments`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
