import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env["DATABASE_URL"]!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.service.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.organization.deleteMany();

  // ─── DEMO FIRMS / ORGANIZATIONS ──────────────────────────────────────
  const demoFirms = await prisma.$transaction([
    prisma.organization.create({
      data: {
        name: "Broom & Bloom Cleaning",
        slug: "broom-bloom-cleaning",
        description: "Profesyonel ev & ofis temizliği hizmetleri. Brugge merkezli, BV/SRL statüsünde kaliteli ve güvenilir temizlik çözümleri.",
        website: "https://broomandbloom.be",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Schoonmaak Direct NL",
        slug: "schoonmaak-direct-nl",
        description: "Amsterdam merkezli endüstriyel temizlik ve warehouse cleaning uzmanı. Büyük ölçekli depo ve üretim tesisleri için profesyonel çözümler.",
        website: "https://schoonmaakdirect.nl",
      },
    }),
    prisma.organization.create({
      data: {
        name: "PureSpace Brussels",
        slug: "purespace-brussels",
        description: "Brüksel merkezli premium ofis ve healthcare facility temizliği. Hijyen standartlarında uzmanlaşmış, sağlık sektörüne özel temizlik hizmetleri.",
        website: "https://purespace.brussels",
      },
    }),
  ]);
  console.log(`✅ ${demoFirms.length} demo firms (organizations) created`);

  // Companies linked to demo firms
  const demoCompanies = await prisma.$transaction([
    prisma.company.create({
      data: {
        name: "Broom & Bloom Cleaning BV",
        description: "Ev ve ofis temizliği uzmanı — Brugge, Belçika",
        organizationId: demoFirms[0].id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Schoonmaak Direct NL B.V.",
        description: "Endüstriyel ve warehouse temizlik — Amsterdam, Hollanda",
        organizationId: demoFirms[1].id,
      },
    }),
    prisma.company.create({
      data: {
        name: "PureSpace Brussels NV",
        description: "Premium ofis ve healthcare temizliği — Brüksel, Belçika",
        organizationId: demoFirms[2].id,
      },
    }),
  ]);
  console.log(`✅ ${demoCompanies.length} companies created`);

  // Main CleanFix Organization
  const org = await prisma.organization.create({
    data: { name: "CleanFix Ltd.", slug: "cleanfix", description: "Profesyonel temizlik ve bakım hizmetleri", website: "https://cleanfix.com" },
  });

  // Services
  const services = await prisma.$transaction([
    prisma.service.create({ data: { name: "Ev Temizliği", description: "Genel ev temizliği — mutfak, banyo, salon, yatak odaları", price: 450, duration: 120, active: true } }),
    prisma.service.create({ data: { name: "Ofis Temizliği", description: "Profesyonel ofis ve iş yeri temizliği", price: 1200, duration: 180, active: true } }),
    prisma.service.create({ data: { name: "Halı Yıkama", description: "Derinlemesine halı yıkama ve kurutma", price: 320, duration: 90, active: true } }),
    prisma.service.create({ data: { name: "Koltuk Yıkama", description: "Koltuk ve kanepe kumaş temizliği", price: 280, duration: 60, active: true } }),
    prisma.service.create({ data: { name: "Cam Temizliği", description: "İç ve dış cephe cam temizliği", price: 180, duration: 45, active: true } }),
    prisma.service.create({ data: { name: "Dış Cephe Temizliği", description: "Bina dış cephe yıkama ve boya öncesi hazırlık", price: 2100, duration: 240, active: false } }),
    prisma.service.create({ data: { name: "İnşaat Sonrası Temizlik", description: "Yeni yapılmış veya renovasyon sonrası detaylı temizlik", price: 850, duration: 300, active: true } }),
    prisma.service.create({ data: { name: "Dezenfeksiyon", description: "Hijyenik alan dezenfeksiyonu ve sterilizasyon", price: 550, duration: 120, active: true } }),
    prisma.service.create({ data: { name: "Boya Badana", description: "İç mekan boya ve badana hizmeti", price: 1500, duration: 480, active: true } }),
    prisma.service.create({ data: { name: "Marangozluk", description: "Ahşap tamiri, dolap montajı, kapı ayarı", price: 650, duration: 180, active: true } }),
  ]);
  console.log(`✅ ${services.length} services created`);

  // Staff
  const staffMembers = await prisma.$transaction([
    prisma.staff.create({ data: { name: "Ali Korkmaz", email: "ali@cleanfix.com", phone: "+90 532 111 22 33", role: "EMPLOYEE", active: true } }),
    prisma.staff.create({ data: { name: "Merve Toprak", email: "merve@cleanfix.com", phone: "+90 533 222 33 44", role: "MANAGER", active: true } }),
    prisma.staff.create({ data: { name: "Burak Şahin", email: "burak@cleanfix.com", phone: "+90 535 333 44 55", role: "EMPLOYEE", active: true } }),
    prisma.staff.create({ data: { name: "Deniz Yıldız", email: "deniz@cleanfix.com", phone: "+90 536 444 55 66", role: "EMPLOYEE", active: true } }),
    prisma.staff.create({ data: { name: "Can Özdemir", email: "can@cleanfix.com", phone: "+90 537 555 66 77", role: "ADMIN", active: true } }),
    prisma.staff.create({ data: { name: "Selin Koç", email: "selin@cleanfix.com", phone: "+90 538 666 77 88", role: "EMPLOYEE", active: true } }),
    prisma.staff.create({ data: { name: "Emre Kaya", email: "emre@cleanfix.com", phone: "+90 539 777 88 99", role: "EMPLOYEE", active: false } }),
    prisma.staff.create({ data: { name: "Dilara Aydın", email: "dilara@cleanfix.com", phone: "+90 540 888 99 00", role: "EMPLOYEE", active: true } }),
  ]);
  console.log(`✅ ${staffMembers.length} staff created`);

  // Customers
  const customers = await prisma.$transaction([
    prisma.customer.create({ data: { name: "Ahmet Yılmaz", email: "ahmet.yilmaz@email.com", phone: "+90 555 123 45 67", address: "Kadıköy, İstanbul", notes: "Aylık düzenli müşteri" } }),
    prisma.customer.create({ data: { name: "Ayşe Kaya", email: "ayse.kaya@email.com", phone: "+90 555 234 56 78", address: "Beşiktaş, İstanbul", notes: "Ofis temizliği her Cuma" } }),
    prisma.customer.create({ data: { name: "Mehmet Demir", email: "mehmet.demir@email.com", phone: "+90 555 345 67 89", address: "Ataşehir, İstanbul", notes: "Halı yıkama 3 ayda bir" } }),
    prisma.customer.create({ data: { name: "Fatma Şahin", email: "fatma.sahin@email.com", phone: "+90 555 456 78 90", address: "Maltepe, İstanbul", notes: "Koltuk yıkama talebi" } }),
    prisma.customer.create({ data: { name: "Ali Can", email: "ali.can@email.com", phone: "+90 555 567 89 01", address: "Şişli, İstanbul", notes: "Dış cephe temizliği apartman yöneticisi" } }),
    prisma.customer.create({ data: { name: "Zeynep Arslan", email: "zeynep.arslan@email.com", phone: "+90 555 678 90 12", address: "Üsküdar, İstanbul", notes: "İlk kez hizmet alacak" } }),
    prisma.customer.create({ data: { name: "Murat Tekin", email: "murat.tekin@email.com", phone: "+90 555 789 01 23", address: "Bakırköy, İstanbul", notes: "İnşaat sonrası temizlik" } }),
    prisma.customer.create({ data: { name: "Elif Korkmaz", email: "elif.korkmaz@email.com", phone: "+90 555 890 12 34", address: "Pendik, İstanbul", notes: "Dezenfeksiyon hizmeti" } }),
    prisma.customer.create({ data: { name: "Serkan Yıldız", email: "serkan.yildiz@email.com", phone: "+90 555 901 23 45", address: "Kartal, İstanbul", notes: "Boya badana talebi" } }),
    prisma.customer.create({ data: { name: "Deniz Özdemir", email: "deniz.ozdemir@email.com", phone: "+90 555 012 34 56", address: "Tuzla, İstanbul", notes: "Marangozluk hizmeti" } }),
    prisma.customer.create({ data: { name: "Hakan Aydın", email: "hakan.aydin@email.com", phone: "+90 555 111 22 33", address: "Sarıyer, İstanbul", notes: "Cam temizliği villa" } }),
    prisma.customer.create({ data: { name: "Sibel Koç", email: "sibel.koc@email.com", phone: "+90 555 222 33 44", address: "Beylikdüzü, İstanbul", notes: "Haftalık ev temizliği" } }),
  ]);
  console.log(`✅ ${customers.length} customers created`);

  // Bookings (realistic schedule)
  const bookings = await prisma.$transaction([
    prisma.booking.create({ data: { customerId: customers[0].id, serviceId: services[0].id, staffId: staffMembers[0].id, date: new Date("2025-05-15"), time: "09:00", status: "COMPLETED", notes: "Müşteri memnun" } }),
    prisma.booking.create({ data: { customerId: customers[1].id, serviceId: services[1].id, staffId: staffMembers[1].id, date: new Date("2025-05-15"), time: "14:00", status: "COMPLETED", notes: "Ofis temizliği tamamlandı" } }),
    prisma.booking.create({ data: { customerId: customers[2].id, serviceId: services[2].id, staffId: staffMembers[2].id, date: new Date("2025-05-16"), time: "10:00", status: "COMPLETED", notes: "Halılar kurutuldu" } }),
    prisma.booking.create({ data: { customerId: customers[3].id, serviceId: services[3].id, staffId: staffMembers[3].id, date: new Date("2025-05-16"), time: "16:00", status: "IN_PROGRESS", notes: "Koltuk temizliği devam ediyor" } }),
    prisma.booking.create({ data: { customerId: customers[4].id, serviceId: services[4].id, staffId: staffMembers[0].id, date: new Date("2025-05-17"), time: "09:00", status: "CONFIRMED", notes: "Villa cam temizliği" } }),
    prisma.booking.create({ data: { customerId: customers[5].id, serviceId: services[0].id, staffId: staffMembers[5].id, date: new Date("2025-05-17"), time: "11:00", status: "PENDING", notes: "İlk ziyaret" } }),
    prisma.booking.create({ data: { customerId: customers[6].id, serviceId: services[6].id, staffId: staffMembers[2].id, date: new Date("2025-05-18"), time: "08:00", status: "CONFIRMED", notes: "İnşaat sonrası büyük temizlik" } }),
    prisma.booking.create({ data: { customerId: customers[7].id, serviceId: services[7].id, staffId: staffMembers[3].id, date: new Date("2025-05-18"), time: "13:00", status: "PENDING", notes: "Dezenfeksiyon" } }),
    prisma.booking.create({ data: { customerId: customers[8].id, serviceId: services[8].id, staffId: staffMembers[6].id, date: new Date("2025-05-19"), time: "09:00", status: "CANCELLED", notes: "Müşteri iptal etti" } }),
    prisma.booking.create({ data: { customerId: customers[9].id, serviceId: services[9].id, staffId: staffMembers[7].id, date: new Date("2025-05-19"), time: "14:00", status: "CONFIRMED", notes: "Dolap montajı" } }),
    prisma.booking.create({ data: { customerId: customers[10].id, serviceId: services[4].id, staffId: staffMembers[0].id, date: new Date("2025-05-20"), time: "10:00", status: "PENDING", notes: "Villa 3 katlı" } }),
    prisma.booking.create({ data: { customerId: customers[11].id, serviceId: services[0].id, staffId: staffMembers[5].id, date: new Date("2025-05-20"), time: "15:00", status: "CONFIRMED", notes: "Haftalık düzenli" } }),
  ]);
  console.log(`✅ ${bookings.length} bookings created`);

  // Invoices
  const invoices = await prisma.$transaction([
    prisma.invoice.create({ data: { customerId: customers[0].id, amount: 450, status: "PAID", dueDate: new Date("2025-06-15"), paidDate: new Date("2025-05-15") } }),
    prisma.invoice.create({ data: { customerId: customers[1].id, amount: 1200, status: "PAID", dueDate: new Date("2025-06-15"), paidDate: new Date("2025-05-15") } }),
    prisma.invoice.create({ data: { customerId: customers[2].id, amount: 320, status: "PAID", dueDate: new Date("2025-06-16"), paidDate: new Date("2025-05-16") } }),
    prisma.invoice.create({ data: { customerId: customers[3].id, amount: 280, status: "OVERDUE", dueDate: new Date("2025-04-20") } }),
    prisma.invoice.create({ data: { customerId: customers[4].id, amount: 180, status: "SENT", dueDate: new Date("2025-06-17") } }),
    prisma.invoice.create({ data: { customerId: customers[5].id, amount: 450, status: "DRAFT", dueDate: new Date("2025-06-20") } }),
    prisma.invoice.create({ data: { customerId: customers[6].id, amount: 850, status: "SENT", dueDate: new Date("2025-06-18") } }),
    prisma.invoice.create({ data: { customerId: customers[7].id, amount: 550, status: "PAID", dueDate: new Date("2025-06-19"), paidDate: new Date("2025-05-17") } }),
  ]);
  console.log(`✅ ${invoices.length} invoices created`);

  // Users (for auth)
  await prisma.user.createMany({
    data: [
      { email: "admin@cleanfix.com", name: "Admin User", role: "ADMIN", organizationId: org.id },
      { email: "manager@cleanfix.com", name: "Manager User", role: "MANAGER", organizationId: org.id },
      { email: "customer@email.com", name: "Customer User", role: "CUSTOMER" },
      { email: "employee@cleanfix.com", name: "Employee User", role: "EMPLOYEE", organizationId: org.id },
    ],
  });
  console.log(`✅ 4 users created`);

  // Print demo firm details
  console.log("\n🏢 DEMO FIRMS:");
  demoFirms.forEach((firm, i) => {
    console.log(`  ${i + 1}. ${firm.name}`);
    console.log(`     slug: ${firm.slug}`);
    console.log(`     website: ${firm.website}`);
    console.log(`     description: ${firm.description}`);
    console.log(`     id: ${firm.id}`);
    console.log(`     createdAt: ${firm.createdAt.toISOString()}`);
  });

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
