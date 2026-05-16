import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

let prisma: PrismaClient;

if (connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // Fallback for local dev without DB
  prisma = new PrismaClient() as any;
}

export { prisma };
export const Role = { ADMIN: "ADMIN", MANAGER: "MANAGER", EMPLOYEE: "EMPLOYEE", CUSTOMER: "CUSTOMER" };
export const BookingStatus = { PENDING: "PENDING", CONFIRMED: "CONFIRMED", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" };
export const InvoiceStatus = { DRAFT: "DRAFT", SENT: "SENT", PAID: "PAID", OVERDUE: "OVERDUE", CANCELLED: "CANCELLED" };
