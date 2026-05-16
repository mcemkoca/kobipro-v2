import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "KobiPro CleanFix",
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL ? "vercel" : "local",
  });
}
