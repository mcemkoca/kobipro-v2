import { NextResponse } from "next/server";
import { prisma } from "@kobipro/db";

export async function GET() {
  let dbStatus = "unknown";
  let dbError = null;
  let serviceCount = 0;

  try {
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM services`;
    serviceCount = Number((result as any)[0]?.count || 0);
    dbStatus = "connected";
  } catch (e: any) {
    dbStatus = "error";
    dbError = e.message;
  }

  return NextResponse.json({
    status: "ok",
    service: "KobiPro CleanFix",
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL ? "vercel" : "local",
    dbStatus,
    serviceCount,
    dbError,
  });
}