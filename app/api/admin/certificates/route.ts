import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createCertificate,
  listCertificates,
} from "@/lib/admin/certificates";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const CreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    issuer: z.string().trim().max(200).optional().default(""),
    date: z.string().trim().max(100).optional().default(""),
    imageUrl: z.string().trim().url().max(1000),
  })
  .strict();

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/experience");
}

export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;
  const rows = await listCertificates();
  return NextResponse.json({ certificates: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await createCertificate(parsed.data);
  revalidatePublic();
  return NextResponse.json({ certificate: created }, { status: 201 });
}
