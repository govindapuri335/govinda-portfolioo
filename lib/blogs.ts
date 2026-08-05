import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { posts } from "@/db/schema";

/**
 * Public shape consumed by the UI. Kept structurally identical to the previous
 * filesystem-driven types so downstream components (BlogCard, list page, post
 * page, sitemap, JSON-LD) don't need to change.
 */
export interface BlogFrontmatter {
  title: string;
  date: string; // ISO string
  description: string;
  tags: string[];
  coverImage?: string;
  readingTime?: number;
  featured?: boolean;
}

export interface BlogMeta extends BlogFrontmatter {
  slug: string;
}

export interface BlogPost extends BlogMeta {
  contentHtml: string;
}

type PostRow = typeof posts.$inferSelect;

function rowToMeta(row: PostRow): BlogMeta {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date.toISOString(),
    description: row.description ?? "",
    tags: row.tags ?? [],
    coverImage: row.coverImage ?? undefined,
    readingTime: row.readingTime ?? undefined,
    featured: row.featured ?? false,
  };
}

function rowToPost(row: PostRow): BlogPost {
  return {
    ...rowToMeta(row),
    contentHtml: row.contentHtml ?? "",
  };
}

/**
 * Wraps a DB query in a try/catch that logs and returns a fallback. This
 * keeps `next build` from failing entirely if the DB is unreachable at build
 * time (e.g. during initial deploys before DATABASE_URL is provisioned).
 * In production ISR will re-attempt on the next revalidation window.
 */
async function safeQuery<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.error(`[blogs] ${label} failed:`, err);
    return fallback;
  }
}

/** Slugs of all *published* posts. Used by `generateStaticParams`. */
export async function getAllBlogSlugs(): Promise<string[]> {
  return safeQuery(
    "getAllBlogSlugs",
    async () => {
      const rows = await db
        .select({ slug: posts.slug })
        .from(posts)
        .where(eq(posts.published, true));
      return rows.map((r) => r.slug);
    },
    []
  );
}

/** Metadata for all *published* posts, newest first. */
export async function getAllBlogsMeta(): Promise<BlogMeta[]> {
  return safeQuery(
    "getAllBlogsMeta",
    async () => {
      const rows = await db
        .select()
        .from(posts)
        .where(eq(posts.published, true))
        .orderBy(desc(posts.date));
      return rows.map(rowToMeta);
    },
    []
  );
}

/**
 * Full post by slug. Only returns *published* posts on the public site.
 * Returns null when not found (callers should map to `notFound()`).
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return safeQuery(
    "getBlogPost",
    async () => {
      const rows = await db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.published, true)))
        .limit(1);
      return rows[0] ? rowToPost(rows[0]) : null;
    },
    null
  );
}

/** Featured posts (published + featured), falls back to the latest 3 published. */
export async function getFeaturedBlogs(): Promise<BlogMeta[]> {
  return safeQuery(
    "getFeaturedBlogs",
    async () => {
      const featured = await db
        .select()
        .from(posts)
        .where(and(eq(posts.published, true), eq(posts.featured, true)))
        .orderBy(desc(posts.date))
        .limit(3);

      if (featured.length > 0) return featured.map(rowToMeta);

      const latest = await db
        .select()
        .from(posts)
        .where(eq(posts.published, true))
        .orderBy(desc(posts.date))
        .limit(3);
      return latest.map(rowToMeta);
    },
    []
  );
}

/** Estimates reading time (~200 wpm). Accepts either markdown or plain text. */
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
