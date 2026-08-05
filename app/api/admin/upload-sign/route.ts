import { NextResponse } from "next/server";

import { signUpload } from "@/lib/cloudinary";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = signUpload();
    return NextResponse.json(payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to sign upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
