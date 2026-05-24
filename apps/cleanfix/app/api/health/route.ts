import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "KobiPro CleanFix",
    timestamp: "2026-05-25T00:00:00.000Z",
    env: "static",
    version: "2.0.0",
  });
}
