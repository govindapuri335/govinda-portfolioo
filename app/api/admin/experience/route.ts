import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createExperience,
  listExperiences,
} from "@/lib/admin/experience";
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
    company: z.string().trim().min(1).max(200),
    date: z.string().trim().min(1).max(100),
    location: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional().nullable(),
    bullets: z.array(z.string().trim().min(1).max(2000)).max(50).default([]),
  })
  .strict();

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/experience");
}

export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;
  const rows = await listExperiences();
  return NextResponse.json({ experiences: rows });
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

  const created = await createExperience({
    ...parsed.data,
    description: parsed.data.description ?? null,
  });
  revalidatePublic();
  return NextResponse.json({ experience: created }, { status: 201 });
}
