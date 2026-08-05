import "dotenv/config";

import fs from "fs";
import path from "path";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import matter from "gray-matter";
import postgres from "postgres";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

import { posts } from "./schema";

const BLOGS_DIR = path.join(process.cwd(), "content/blogs");

function normalizeRawMarkdown(raw: string): string {
  const lines = raw.split(/\r?\n/);
  while (lines.length > 0 && /^\s*`{3,}/.test(lines[0])) lines.shift();
  while (lines.length > 0 && /^\s*`{3,}/.test(lines[lines.length - 1]))
    lines.pop();
  return lines.join("\n");
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

async function markdownToHtml(md: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(md);
  return processed.toString();
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required to seed");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  if (!fs.existsSync(BLOGS_DIR)) {
    console.log(`No content directory at ${BLOGS_DIR}, nothing to seed.`);
    await client.end();
    return;
  }

  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.log("No markdown files found, nothing to seed.");
    await client.end();
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOGS_DIR, file), "utf8");
    const normalized = normalizeRawMarkdown(raw);
    const { data, content } = matter(normalized);

    const contentHtml = await markdownToHtml(content);
    const readingTime =
      typeof data.readingTime === "number"
        ? data.readingTime
        : estimateReadingTime(content);

    const values = {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      contentHtml,
      contentJson: null,
      coverImage: data.coverImage ? String(data.coverImage) : null,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      readingTime,
      featured: Boolean(data.featured),
      published: true,
      date: data.date ? new Date(String(data.date)) : new Date(),
    };

    // ON CONFLICT DO NOTHING so re-running the seed is safe.
    const result = await db
      .insert(posts)
      .values(values)
      .onConflictDoNothing({ target: posts.slug })
      .returning({ id: posts.id });

    if (result.length > 0) {
      inserted++;
      console.log(`  + ${slug}`);
    } else {
      skipped++;
      console.log(`  = ${slug} (already exists)`);
    }
  }

  // Reset the id sequence so the next insert doesn't collide.
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('posts', 'id'), COALESCE((SELECT MAX(id) FROM posts), 0) + 1, false)`
  );

  console.log(`\nSeed complete. Inserted ${inserted}, skipped ${skipped}.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
