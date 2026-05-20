import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env["DATABASE_URL"];

let prisma: PrismaClient;

if (connectionString) {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // Build-time or missing DB — create PrismaClient without adapter
  // to avoid PrismaClientInitializationError
  prisma = new PrismaClient();
  console.warn("[Prisma] DATABASE_URL not set — running without DB adapter");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export * from "@prisma/client";