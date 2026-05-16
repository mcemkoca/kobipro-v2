import type { NextRequest, NextResponse } from "next/server";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: string;
      organizationId?: string;
    };
  }
}

export {};
