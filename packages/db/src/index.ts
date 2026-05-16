import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const hasDb = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("dummy"));

let prisma: PrismaClient;

if (hasDb) {
  const connectionString = process.env["DATABASE_URL"] || "";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} else {
  // Demo mode: mock prisma that throws DB errors (triggers demo data fallbacks)
  const err = () => {
    const e = new Error("DATABASE_CONNECTION_FAILED");
    throw e;
  };

  const mockModel = {
    findMany: err,
    findUnique: err,
    findFirst: err,
    findUniqueOrThrow: err,
    findFirstOrThrow: err,
    create: err,
    createMany: err,
    update: err,
    updateMany: err,
    upsert: err,
    delete: err,
    deleteMany: err,
    count: err,
    aggregate: err,
    groupBy: err,
    aggregateRaw: err,
    findRaw: err,
  };

  prisma = {
    $connect: err,
    $disconnect: async () => {},
    $transaction: async () => [],
    $queryRaw: err,
    $queryRawUnsafe: err,
    $executeRaw: err,
    $executeRawUnsafe: err,
    $extends: err,
    $on: () => {},
    service: mockModel,
    booking: mockModel,
    customer: mockModel,
    staff: mockModel,
    invoice: mockModel,
    user: mockModel,
    organization: mockModel,
    company: mockModel,
    payment: mockModel,
  } as unknown as PrismaClient;
}

export { prisma };
export * from "@prisma/client";
