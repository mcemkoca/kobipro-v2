// Mock PrismaClient for demo mode (no database required)
// When DATABASE_URL is available, this loads the real PrismaClient

const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("dummy");

let prisma: any;

if (isDemoMode) {
  // Demo mode: mock prisma that throws DB errors (triggers demo data fallbacks)
  prisma = {
    $connect: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); },
    $disconnect: async () => {},
    service: { findMany: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, findUnique: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, create: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, update: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, delete: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); } },
    booking: { findMany: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, findUnique: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, create: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, update: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, delete: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); } },
    customer: { findMany: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, findUnique: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, create: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, update: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, delete: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); } },
    staff: { findMany: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, findUnique: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, create: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, update: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, delete: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); } },
    invoice: { findMany: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, findUnique: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, create: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, update: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); }, delete: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); } },
    user: { findMany: async () => { throw new Error("DATABASE_CONNECTION_FAILED"); } },
  };
} else {
  // Real database mode
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient();
}

export { prisma };
export const Role = { ADMIN: "ADMIN", MANAGER: "MANAGER", EMPLOYEE: "EMPLOYEE", CUSTOMER: "CUSTOMER" };
export const BookingStatus = { PENDING: "PENDING", CONFIRMED: "CONFIRMED", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" };
export const InvoiceStatus = { DRAFT: "DRAFT", SENT: "SENT", PAID: "PAID", OVERDUE: "OVERDUE", CANCELLED: "CANCELLED" };
