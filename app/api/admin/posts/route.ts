import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db/client";
import { posts } from "@/db/schema";
import {
  ensureUniqueSlug,
  estimateReadingTimeFromHtml,
  slugify,
} from "@/lib/admin/posts";
import { isAuthenticated } from "@/lib/session";

export const runtime = "nodejs";

const CreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  slug: z.string().trim().max(255).optional(),
  description: z.string().trim().max(600).default(""),
  contentHtml: z.string().default(""),
  contentJson: z.string().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(20).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  date: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const data = parsed.data;
  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
  const slug = await ensureUniqueSlug(baseSlug || "post");

  const readingTime = estimateReadingTimeFromHtml(data.contentHtml);

  const inserted = await db
    .insert(posts)
    .values({
      slug,
      title: data.title,
      description: data.description,
      contentHtml: data.contentHtml,
      contentJson: data.contentJson ?? null,
      coverImage: data.coverImage ?? null,
      tags: data.tags,
      readingTime,
      featured: data.featured,
      published: data.published,
      date: data.date ? new Date(data.date) : new Date(),
    })
    .returning();

  const created = inserted[0];

  // Revalidate any page that lists posts.
  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/sitemap.xml");
  if (created.published) {
    revalidatePath(`/blogs/${created.slug}`);
  }

  return NextResponse.json({ post: created }, { status: 201 });
}
