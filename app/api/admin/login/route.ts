import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { limit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still do a comparison to avoid short-circuit timing leaks.
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 500 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // 10 attempts per 10 minutes per IP.
  const rl = await limit(`admin-login:${ip}`, 10, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.resetInSeconds) },
      }
    );
  }

  let password: string | undefined;
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : undefined;
  } catch {
    // ignore
  }

  if (!password || !timingSafeEqualStr(password, adminPassword)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  session.loggedInAt = Date.now();
  await session.save();

  return NextResponse.json({ ok: true });
}
