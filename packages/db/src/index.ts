import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const Role = { ADMIN: "ADMIN", MANAGER: "MANAGER", EMPLOYEE: "EMPLOYEE", CUSTOMER: "CUSTOMER" };
export const BookingStatus = { PENDING: "PENDING", CONFIRMED: "CONFIRMED", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" };
export const InvoiceStatus = { DRAFT: "DRAFT", SENT: "SENT", PAID: "PAID", OVERDUE: "OVERDUE", CANCELLED: "CANCELLED" };
