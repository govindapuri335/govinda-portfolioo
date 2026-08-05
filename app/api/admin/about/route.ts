import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAbout, updateAbout } from "@/lib/admin/about";
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
    introParagraphs: z
      .array(z.string().trim().min(1).max(2000))
      .max(20)
      .optional(),
    communityTitle: z.string().trim().min(1).max(200).optional(),
    communityItems: z
      .array(z.string().trim().min(1).max(1000))
      .max(50)
      .optional(),
  })
  .strict();

export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;
  const about = await getAbout();
  return NextResponse.json({ about });
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

  const updated = await updateAbout(parsed.data);
  revalidatePath("/about");
  return NextResponse.json({ about: updated });
}
