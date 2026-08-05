import { NextResponse } from "next/server";

import { listContactSubmissions } from "@/lib/admin/contacts";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;

  const rows = await listContactSubmissions();
  return NextResponse.json({ contacts: rows });
}
