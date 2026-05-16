// Smart PrismaClient: real DB when DATABASE_URL is set, mock when not
const hasDb = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dummy"));

let prisma: any;

if (hasDb) {
  const { PrismaClient } = require("@prisma/client");
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
} else {
  // Demo mode: mock prisma that throws DB errors (triggers demo data fallbacks)
  const err = () => {
    const e = new Error("DATABASE_CONNECTION_FAILED");
    throw e;
  };
  prisma = {
    $connect: err,
    $disconnect: async () => {},
    service: { findMany: err, findUnique: err, create: err, update: err, delete: err },
    booking: { findMany: err, findUnique: err, create: err, update: err, delete: err },
    customer: { findMany: err, findUnique: err, create: err, update: err, delete: err },
    staff: { findMany: err, findUnique: err, create: err, update: err, delete: err },
    invoice: { findMany: err, findUnique: err, create: err, update: err, delete: err },
    user: { findMany: err },
  };
}

export { prisma };
export const Role = { ADMIN: "ADMIN", MANAGER: "MANAGER", EMPLOYEE: "EMPLOYEE", CUSTOMER: "CUSTOMER" };
export const BookingStatus = { PENDING: "PENDING", CONFIRMED: "CONFIRMED", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" };
export const InvoiceStatus = { DRAFT: "DRAFT", SENT: "SENT", PAID: "PAID", OVERDUE: "OVERDUE", CANCELLED: "CANCELLED" };
