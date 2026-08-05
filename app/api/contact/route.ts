import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createContactSubmission } from "@/lib/admin/contacts";
import { sendContactNotification } from "@/lib/mailer";
import { limit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Public contact-form endpoint.
 *
 * Flow:
 *   1. Validate payload with zod (matches the schema in the client form).
 *   2. Rate-limit per IP (5 submissions / 10 min) to deter spam. Falls open
 *      when Upstash is unconfigured.
 *   3. Insert into `contact_submissions` (source of truth).
 *   4. Fire an email notification to the site owner via Resend. Email failure
 *      is logged but does NOT fail the request — the message is safely saved.
 *
 * The admin panel (/admin/contacts) surfaces every stored submission for
 * later reference.
 */

const SocialSchema = z.object({
  platform: z.string().trim().max(60),
  value: z.string().trim().max(300),
});

const ContactSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(320),
    message: z.string().trim().min(10).max(5000),
    socials: z.array(SocialSchema).max(10).optional(),
  })
  .strict();

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  // Parse + validate first so obvious garbage doesn't consume a rate-limit slot.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ip = getClientIp(req);
  const rl = await limit(`contact:${ip}`, 5, 600);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Too many submissions. Please try again later.",
        retryAfter: rl.resetInSeconds,
      },
      { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } }
    );
  }

  const userAgent = req.headers.get("user-agent") ?? null;

  // 1. Persist first — never lose a legitimate message even if mail fails.
  let savedId: number;
  try {
    const saved = await createContactSubmission({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      socials: parsed.data.socials ?? [],
      ip,
      userAgent,
    });
    savedId = saved.id;
  } catch (e) {
    console.error("[/api/contact] DB insert failed", e);
    return NextResponse.json(
      { error: "Could not save your message. Please try again." },
      { status: 500 }
    );
  }

  // 2. Fire notification email (soft-fail: does not block the response).
  const mail = await sendContactNotification({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    socials: parsed.data.socials ?? [],
    ip,
    userAgent,
  });
  if (!mail.ok) {
    console.warn(
      `[/api/contact] submission #${savedId} saved but email failed: ${mail.error}`
    );
  }

  return NextResponse.json({
    ok: true,
    id: savedId,
    emailSent: mail.ok,
  });
}
