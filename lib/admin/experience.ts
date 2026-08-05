import "server-only";

import { asc, eq, sql as sqlOp } from "drizzle-orm";

import { db } from "@/db/client";
import { experiences, type Experience } from "@/db/schema";
import { professionalExperience } from "@/config/experience";

/**
 * Return all experience roles in display order (sortOrder asc, then id asc as
 * a stable tiebreaker).
 *
 * On first read after migration the table is empty — we seed it from the
 * static `professionalExperience` list in `config/experience.ts` so nothing
 * is lost during migration and the public /experience page never renders
 * empty.
 */
export async function listExperiences(): Promise<Experience[]> {
  const rows = await db
    .select()
    .from(experiences)
    .orderBy(asc(experiences.sortOrder), asc(experiences.id));
  if (rows.length > 0) return rows;

  await db
    .insert(experiences)
    .values(
      professionalExperience.map((r, i) => ({
        title: r.title,
        company: r.company,
        date: r.date,
        location: r.location,
        description: r.description ?? null,
        bullets: r.bullets,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing();

  return db
    .select()
    .from(experiences)
    .orderBy(asc(experiences.sortOrder), asc(experiences.id));
}

export async function getExperienceById(
  id: number
): Promise<Experience | null> {
  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export interface ExperienceInput {
  title: string;
  company: string;
  date: string;
  location: string;
  description?: string | null;
  bullets: string[];
}

export async function createExperience(
  input: ExperienceInput
): Promise<Experience> {
  const [{ max }] = await db
    .select({ max: sqlOp<number>`COALESCE(MAX(${experiences.sortOrder}), -1)` })
    .from(experiences);

  const [created] = await db
    .insert(experiences)
    .values({
      title: input.title,
      company: input.company,
      date: input.date,
      location: input.location,
      description: input.description ?? null,
      bullets: input.bullets,
      sortOrder: (max ?? -1) + 1,
    })
    .returning();
  return created;
}

export async function updateExperience(
  id: number,
  patch: Partial<ExperienceInput> & { sortOrder?: number }
): Promise<Experience | null> {
  const existing = await getExperienceById(id);
  if (!existing) return null;
  const [updated] = await db
    .update(experiences)
    .set({
      title: patch.title ?? existing.title,
      company: patch.company ?? existing.company,
      date: patch.date ?? existing.date,
      location: patch.location ?? existing.location,
      description:
        patch.description === undefined
          ? existing.description
          : patch.description,
      bullets: patch.bullets ?? existing.bullets,
      sortOrder: patch.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(experiences.id, id))
    .returning();
  return updated;
}

export async function deleteExperience(id: number): Promise<boolean> {
  const rows = await db
    .delete(experiences)
    .where(eq(experiences.id, id))
    .returning();
  return rows.length > 0;
}
