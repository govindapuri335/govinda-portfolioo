import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSkill, listSkills } from "@/lib/admin/skills";
import { isSkillIconKey } from "@/lib/icons";
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
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    rating: z.number().int().min(1).max(5),
    iconKey: z.string().trim().min(1).max(64).refine(isSkillIconKey, {
      message: "Unknown icon",
    }),
  })
  .strict();

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/skills");
}

export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;
  const rows = await listSkills();
  return NextResponse.json({ skills: rows });
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

  const created = await createSkill(parsed.data);
  revalidatePublic();
  return NextResponse.json({ skill: created }, { status: 201 });
}
