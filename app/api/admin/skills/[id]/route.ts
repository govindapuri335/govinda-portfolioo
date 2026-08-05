import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteSkill, getSkillById, updateSkill } from "@/lib/admin/skills";
import { isSkillIconKey } from "@/lib/icons";
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
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    iconKey: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .refine(isSkillIconKey, { message: "Unknown icon" })
      .optional(),
  })
  .strict();

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/skills");
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

  const existing = await getSkillById(id);
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

  const updated = await updateSkill(id, parsed.data);
  revalidatePublic();
  return NextResponse.json({ skill: updated });
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

  const ok = await deleteSkill(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePublic();
  return NextResponse.json({ ok: true });
}
