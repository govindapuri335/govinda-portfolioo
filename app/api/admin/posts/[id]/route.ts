import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { posts } from "@/db/schema";
import {
  ensureUniqueSlug,
  estimateReadingTimeFromHtml,
  getPostById,
  slugify,
} from "@/lib/admin/posts";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

const UpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    slug: z.string().trim().max(255).optional(),
    description: z.string().trim().max(600).optional(),
    contentHtml: z.string().optional(),
    contentJson: z.string().nullable().optional(),
    coverImage: z.string().url().nullable().optional(),
    tags: z.array(z.string().trim().min(1)).max(20).optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
    date: z.string().datetime().optional(),
  })
  .strict();

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function revalidateForPost(oldSlug: string, newSlug: string) {
  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/blogs/${oldSlug}`);
  if (newSlug !== oldSlug) revalidatePath(`/blogs/${newSlug}`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth) return auth;
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
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

  const existing = await getPostById(id);
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
  const patch = parsed.data;

  // Slug: if provided (and different) → ensure unique; else keep existing.
  let nextSlug = existing.slug;
  if (patch.slug != null) {
    const cleaned = slugify(patch.slug);
    if (cleaned && cleaned !== existing.slug) {
      nextSlug = await ensureUniqueSlug(cleaned, id);
    }
  }

  const nextContentHtml =
    patch.contentHtml !== undefined ? patch.contentHtml : existing.contentHtml;

  const readingTime =
    patch.contentHtml !== undefined
      ? estimateReadingTimeFromHtml(patch.contentHtml)
      : existing.readingTime;

  const [updated] = await db
    .update(posts)
    .set({
      title: patch.title ?? existing.title,
      slug: nextSlug,
      description:
        patch.description !== undefined ? patch.description : existing.description,
      contentHtml: nextContentHtml,
      contentJson:
        patch.contentJson !== undefined
          ? patch.contentJson
          : existing.contentJson,
      coverImage:
        patch.coverImage !== undefined ? patch.coverImage : existing.coverImage,
      tags: patch.tags ?? existing.tags,
      readingTime,
      featured: patch.featured ?? existing.featured,
      published: patch.published ?? existing.published,
      date: patch.date ? new Date(patch.date) : existing.date,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  await revalidateForPost(existing.slug, updated.slug);
  return NextResponse.json({ post: updated });
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

  const existing = await getPostById(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(posts).where(eq(posts.id, id));

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/blogs/${existing.slug}`);

  return NextResponse.json({ ok: true });
}
