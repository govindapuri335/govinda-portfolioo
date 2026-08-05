import "server-only";

import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { posts, type Post } from "@/db/schema";

export type PostStatusFilter = "all" | "published" | "draft";

export interface ListPostsOptions {
  search?: string;
  status?: PostStatusFilter;
}

export async function listAllPosts({
  search,
  status = "all",
}: ListPostsOptions = {}): Promise<Post[]> {
  const conditions = [];
  if (status === "published") conditions.push(eq(posts.published, true));
  if (status === "draft") conditions.push(eq(posts.published, false));
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    conditions.push(
      or(ilike(posts.title, q), ilike(posts.slug, q), ilike(posts.description, q))!
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(posts).where(where).orderBy(desc(posts.date));
}

export async function getPostById(id: number): Promise<Post | null> {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Slugify a string: lowercase, ASCII, hyphenated. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/**
 * Returns a slug guaranteed to be unique in the `posts` table.
 * If `excludeId` is provided, that row's own slug is not considered a conflict.
 */
export async function ensureUniqueSlug(
  base: string,
  excludeId?: number
): Promise<string> {
  const clean = slugify(base) || "post";
  let candidate = clean;
  let i = 2;
  // Loop until we find one that doesn't conflict.
  // In practice this rarely runs more than once.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rows = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        excludeId != null
          ? and(eq(posts.slug, candidate), ne(posts.id, excludeId))
          : eq(posts.slug, candidate)
      )
      .limit(1);
    if (rows.length === 0) return candidate;
    candidate = `${clean}-${i++}`;
  }
}

/** Strip HTML tags to compute word count for reading-time estimation. */
export function estimateReadingTimeFromHtml(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
