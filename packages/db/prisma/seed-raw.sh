export PGPASSWORD='L4Vvs2FaUPljRzgH'

DB="postgresql://postgres.lxrdccqkqsjfhpclgimk@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require"

echo "🌱 Seeding database with REAL data..."

# Clear existing data
psql "$DB" -c "DELETE FROM payments; DELETE FROM invoices; DELETE FROM bookings; DELETE FROM staff; DELETE FROM services; DELETE FROM customers; DELETE FROM users; DELETE FROM companies; DELETE FROM organizations;" 2>/dev/null

# Seed Organization
psql "$DB" -c "
INSERT INTO organizations (id, name, slug, description, website, \"createdAt\", \"updatedAt\")
VALUES ('org_cleanfix_001', 'CleanFix Premium Temizlik', 'cleanfix-premium', 'İstanbul merkezli profesyonel temizlik şirketi. Ev, ofis, halı ve inşaat sonrası temizlik hizmetleri.', 'https://cleanfix.com.tr', NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Users
psql "$DB" -c "
INSERT INTO users (id, email, name, role, \"organizationId\", \"createdAt\", \"updatedAt\") VALUES
('user_admin_001', 'admin@cleanfix.com.tr', 'Ahmet Yılmaz', 'ADMIN', 'org_cleanfix_001', NOW(), NOW()),
('user_mgr_001', 'manager@cleanfix.com.tr', 'Mehmet Kaya', 'MANAGER', 'org_cleanfix_001', NOW(), NOW()),
('user_emp_001', 'staff1@cleanfix.com.tr', 'Fatma Şahin', 'EMPLOYEE', 'org_cleanfix_001', NOW(), NOW()),
('user_emp_002', 'staff2@cleanfix.com.tr', 'Ali Demir', 'EMPLOYEE', 'org_cleanfix_001', NOW(), NOW()),
('user_emp_003', 'staff3@cleanfix.com.tr', 'Ayşe Yıldız', 'EMPLOYEE', 'org_cleanfix_001', NOW(), NOW()),
('user_cust_001', 'musteri1@gmail.com', 'Zeynep Korkmaz', 'CUSTOMER', NULL, NOW(), NOW()),
('user_cust_002', 'musteri2@gmail.com', 'Can Özdemir', 'CUSTOMER', NULL, NOW(), NOW()),
('user_cust_003', 'musteri3@gmail.com', 'Elif Aydın', 'CUSTOMER', NULL, NOW(), NOW()),
('user_cust_004', 'musteri4@gmail.com', 'Burak Yılmaz', 'CUSTOMER', NULL, NOW(), NOW()),
('user_cust_005', 'musteri5@gmail.com', 'Deniz Kaya', 'CUSTOMER', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Staff
psql "$DB" -c "
INSERT INTO staff (id, name, email, phone, role, active, \"createdAt\", \"updatedAt\") VALUES
('staff_001', 'Fatma Şahin', 'fatma.sahin@cleanfix.com.tr', '+90 532 111 2233', 'EMPLOYEE', true, NOW(), NOW()),
('staff_002', 'Ali Demir', 'ali.demir@cleanfix.com.tr', '+90 533 444 5566', 'EMPLOYEE', true, NOW(), NOW()),
('staff_003', 'Ayşe Yıldız', 'ayse.yildiz@cleanfix.com.tr', '+90 534 777 8899', 'EMPLOYEE', true, NOW(), NOW()),
('staff_004', 'Hüseyin Koç', 'huseyin.koc@cleanfix.com.tr', '+90 535 000 1122', 'EMPLOYEE', true, NOW(), NOW()),
('staff_005', 'Selin Arslan', 'selin.arslan@cleanfix.com.tr', '+90 536 333 4455', 'EMPLOYEE', false, NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Services
psql "$DB" -c "
INSERT INTO services (id, name, description, price, duration, active, \"createdAt\", \"updatedAt\") VALUES
('svc_001', 'Standart Ev Temizliği', '2 odalı daire için kapsamlı temizlik. Mutfak, banyo, salon ve yatak odası.', 450.00, 180, true, NOW(), NOW()),
('svc_002', 'Ofis Temizliği', '100m² ofis alanı için günlük/haftalık temizlik hizmeti.', 350.00, 120, true, NOW(), NOW()),
('svc_003', 'Halı Yıkama', 'Profesyonel halı yıkama ve kurutma hizmeti. 3 halı paketi.', 600.00, 240, true, NOW(), NOW()),
('svc_004', 'İnşaat Sonrası Temizlik', 'Yeni inşaat veya tadilat sonrası derinlemesine temizlik.', 1200.00, 480, true, NOW(), NOW()),
('svc_005', 'Cam Temizliği', 'Dış ve iç cephe cam temizliği. 10 pencere paketi.', 300.00, 90, true, NOW(), NOW()),
('svc_006', 'Koltuk Yıkama', 'Kumaş ve deri koltuk yıkama hizmeti. 3 koltuk.', 500.00, 150, true, NOW(), NOW()),
('svc_007', 'Dezenfeksiyon', 'UV ve ozon ile alan dezenfeksiyonu. Virüs ve bakteri öldürme.', 800.00, 120, true, NOW(), NOW()),
('svc_008', 'Balkon Temizliği', 'Balkon, teras ve dış mekan temizliği. Mobilya dahil.', 250.00, 90, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Customers
psql "$DB" -c "
INSERT INTO customers (id, name, email, phone, address, notes, \"createdAt\", \"updatedAt\") VALUES
('cust_001', 'Zeynep Korkmaz', 'zeynep.k@email.com', '+90 532 123 4567', 'Kadıköy, İstanbul', 'Aylık düzenli müşteri. 2+1 daire.', NOW(), NOW()),
('cust_002', 'Can Özdemir', 'can.ozdemir@email.com', '+90 533 234 5678', 'Beşiktaş, İstanbul', 'Ofis temizliği her Cuma.', NOW(), NOW()),
('cust_003', 'Elif Aydın', 'elif.aydin@email.com', '+90 534 345 6789', 'Şişli, İstanbul', 'Halı yıkama her 3 ayda bir.', NOW(), NOW()),
('cust_004', 'Burak Yılmaz', 'burak.y@email.com', '+90 535 456 7890', 'Ataşehir, İstanbul', 'İnşaat sonrası temizlik referansı.', NOW(), NOW()),
('cust_005', 'Deniz Kaya', 'deniz.kaya@email.com', '+90 536 567 8901', 'Üsküdar, İstanbul', 'Dezenfeksiyon hizmeti alıcısı.', NOW(), NOW()),
('cust_006', 'Mert Şen', 'mert.sen@email.com', '+90 537 678 9012', 'Maltepe, İstanbul', 'Yeni müşteri. Koltuk yıkama talebi.', NOW(), NOW()),
('cust_007', 'Pınar Demirtaş', 'pinar.d@email.com', '+90 538 789 0123', 'Kartal, İstanbul', 'Cam temizliği her ay.', NOW(), NOW()),
('cust_008', 'Oğuz Tan', 'oguz.tan@email.com', '+90 539 890 1234', 'Pendik, İstanbul', 'Balkon temizliği talep etti.', NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Bookings
psql "$DB" -c "
INSERT INTO bookings (id, \"customerId\", \"serviceId\", \"staffId\", date, time, status, notes, \"createdAt\", \"updatedAt\") VALUES
('book_001', 'cust_001', 'svc_001', 'staff_001', '2026-05-15', '09:00', 'COMPLETED', 'Müşteri memnun kaldı, ek hizmet talep etti.', NOW(), NOW()),
('book_002', 'cust_002', 'svc_002', 'staff_002', '2026-05-16', '14:00', 'COMPLETED', 'Ofis toplantı salonu dahil edildi.', NOW(), NOW()),
('book_003', 'cust_003', 'svc_003', 'staff_003', '2026-05-17', '10:30', 'CONFIRMED', '3 halı + 2 kilim paketi.', NOW(), NOW()),
('book_004', 'cust_004', 'svc_004', 'staff_001', '2026-05-18', '08:00', 'PENDING', '4+1 daire, inşaat sonrası.', NOW(), NOW()),
('book_005', 'cust_005', 'svc_007', 'staff_002', '2026-05-19', '16:00', 'CONFIRMED', 'Ofis dezenfeksiyonu, 200m².', NOW(), NOW()),
('book_006', 'cust_001', 'svc_005', 'staff_003', '2026-05-20', '11:00', 'PENDING', '12 pencere, bina dış cephe dahil.', NOW(), NOW()),
('book_007', 'cust_006', 'svc_006', 'staff_001', '2026-05-21', '13:00', 'PENDING', '2 koltuk + 1 kanepe deri temizliği.', NOW(), NOW()),
('book_008', 'cust_007', 'svc_008', 'staff_002', '2026-05-22', '10:00', 'CONFIRMED', 'Balkon + teras temizliği.', NOW(), NOW()),
('book_009', 'cust_008', 'svc_001', 'staff_003', '2026-05-23', '09:30', 'PENDING', '1+1 daire standart temizlik.', NOW(), NOW()),
('book_010', 'cust_002', 'svc_002', 'staff_001', '2026-05-24', '15:00', 'PENDING', 'Haftalık ofis temizliği - devam eden.', NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Invoices
psql "$DB" -c "
INSERT INTO invoices (id, \"customerId\", amount, status, \"dueDate\", \"paidDate\", \"createdAt\", \"updatedAt\") VALUES
('inv_001', 'cust_001', 450.00, 'PAID', '2026-05-20', '2026-05-18', NOW(), NOW()),
('inv_002', 'cust_002', 350.00, 'PAID', '2026-05-22', '2026-05-19', NOW(), NOW()),
('inv_003', 'cust_003', 600.00, 'SENT', '2026-05-25', NULL, NOW(), NOW()),
('inv_004', 'cust_004', 1200.00, 'DRAFT', '2026-05-30', NULL, NOW(), NOW()),
('inv_005', 'cust_005', 800.00, 'PAID', '2026-05-24', '2026-05-20', NOW(), NOW()),
('inv_006', 'cust_001', 300.00, 'OVERDUE', '2026-05-10', NULL, NOW(), NOW()),
('inv_007', 'cust_006', 500.00, 'SENT', '2026-05-28', NULL, NOW(), NOW()),
('inv_008', 'cust_007', 250.00, 'PAID', '2026-05-23', '2026-05-21', NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Payments
psql "$DB" -c "
INSERT INTO payments (id, \"invoiceId\", amount, method, status, date, \"createdAt\", \"updatedAt\") VALUES
('pay_001', 'inv_001', 450.00, 'CREDIT_CARD', 'COMPLETED', '2026-05-18', NOW(), NOW()),
('pay_002', 'inv_002', 350.00, 'BANK_TRANSFER', 'COMPLETED', '2026-05-19', NOW(), NOW()),
('pay_003', 'inv_005', 800.00, 'CASH', 'COMPLETED', '2026-05-20', NOW(), NOW()),
('pay_004', 'inv_008', 250.00, 'ONLINE', 'COMPLETED', '2026-05-21', NOW(), NOW())
ON CONFLICT DO NOTHING;
"

# Seed Companies
psql "$DB" -c "
INSERT INTO companies (id, name, description, \"organizationId\", \"createdAt\", \"updatedAt\") VALUES
('comp_001', 'CleanFix Ana Şirket', 'Ana operasyon şirketi - tüm temizlik hizmetleri', 'org_cleanfix_001', NOW(), NOW()),
('comp_002', 'CleanFix Halı Yıkama', 'Özel halı ve koltuk yıkama ünitesi', 'org_cleanfix_001', NOW(), NOW()),
('comp_003', 'CleanFix Dezenfeksiyon', 'Dezenfeksiyon ve sterilizasyon hizmetleri', 'org_cleanfix_001', NOW(), NOW())
ON CONFLICT DO NOTHING;
"

echo "✅ REAL seed data inserted successfully!"
