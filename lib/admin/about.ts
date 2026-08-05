import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { aboutPage, type AboutPage } from "@/db/schema";
import { aboutParagraphs as defaultParagraphs } from "@/config/experience";

/** Default community items — mirrors the previous hard-coded list on /about. */
export const defaultCommunityItems: string[] = [
  "Raised $1,500+ for Team for Kids youth running programs via the NYC Half Marathon (March 2026)",
  "HOPE for Depression 5K, Southampton, NY (2025; returning August 2026)",
];

export const defaultCommunityTitle = "Community Involvement";

/**
 * Return the single About row. If the row does not exist yet (fresh DB / first
 * deploy after migration), create it seeded with the current static defaults
 * so the public page never renders empty.
 *
 * No auth here — the public /about page also calls this.
 */
export async function getAbout(): Promise<AboutPage> {
  const rows = await db
    .select()
    .from(aboutPage)
    .orderBy(asc(aboutPage.id))
    .limit(1);
  if (rows[0]) return rows[0];

  const [inserted] = await db
    .insert(aboutPage)
    .values({
      introParagraphs: [...defaultParagraphs],
      communityTitle: defaultCommunityTitle,
      communityItems: [...defaultCommunityItems],
    })
    .returning();
  return inserted;
}

export interface AboutUpdate {
  introParagraphs?: string[];
  communityTitle?: string;
  communityItems?: string[];
}

/** Persist an edit from the admin UI. Fields left undefined are preserved. */
export async function updateAbout(patch: AboutUpdate): Promise<AboutPage> {
  const existing = await getAbout();
  const [updated] = await db
    .update(aboutPage)
    .set({
      introParagraphs: patch.introParagraphs ?? existing.introParagraphs,
      communityTitle: patch.communityTitle ?? existing.communityTitle,
      communityItems: patch.communityItems ?? existing.communityItems,
      updatedAt: new Date(),
    })
    .where(eq(aboutPage.id, existing.id))
    .returning();
  return updated;
}
