import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getLearning, updateLearning } from "@/lib/admin/learning";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const UpdateSchema = z
  .object({
    currentFocusTitle: z.string().trim().min(1).max(200).optional(),
    currentFocusBullets: z
      .array(z.string().trim().min(1).max(1000))
      .max(50)
      .optional(),
    certificationsTitle: z.string().trim().min(1).max(200).optional(),
    certificationsBullets: z
      .array(z.string().trim().min(1).max(1000))
      .max(50)
      .optional(),
  })
  .strict();

export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;
  const learning = await getLearning();
  return NextResponse.json({ learning });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth();
  if (auth) return auth;

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

  const updated = await updateLearning(parsed.data);
  // Both the home page and /experience render this content.
  revalidatePath("/");
  revalidatePath("/experience");
  return NextResponse.json({ learning: updated });
}
