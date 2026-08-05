import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteExperience,
  getExperienceById,
  updateExperience,
} from "@/lib/admin/experience";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const UpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    company: z.string().trim().min(1).max(200).optional(),
    date: z.string().trim().min(1).max(100).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    bullets: z
      .array(z.string().trim().min(1).max(2000))
      .max(50)
      .optional(),
    sortOrder: z.number().int().min(0).max(1000).optional(),
  })
  .strict();

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/experience");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth) return auth;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await getExperienceById(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await updateExperience(id, parsed.data);
  revalidatePublic();
  return NextResponse.json({ experience: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth) return auth;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const ok = await deleteExperience(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePublic();
  return NextResponse.json({ ok: true });
}
