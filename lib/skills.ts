import "server-only";

import { asc, desc } from "drizzle-orm";

import { db } from "@/db/client";
import { skills as skillsTable } from "@/db/schema";
import type { skillsInterface } from "@/config/skills";
import { DEFAULT_SKILLS } from "@/lib/admin/skills";
import { getIcon } from "@/lib/icons";

/** Convert a DB row (or default entry) into the shape SkillsCard expects. */
function toDisplaySkill(row: {
  name: string;
  description: string;
  rating: number;
  iconKey: string;
}): skillsInterface {
  return {
    name: row.name,
    description: row.description,
    rating: row.rating,
    icon: getIcon(row.iconKey),
  };
}

/**
 * Return all skills for the public site.
 *
 * - Reads from Postgres, sorted rating desc (with sortOrder/id as tiebreakers).
 * - If the table is empty OR the DB is unreachable at build time, falls back
 *   to the static `DEFAULT_SKILLS` list so nothing renders empty.
 * - Does NOT auto-seed (that's the admin-side responsibility, in
 *   `lib/admin/skills.ts::listSkills`). Read-only path here.
 */
export async function getPublicSkills(): Promise<skillsInterface[]> {
  try {
    const rows = await db
      .select()
      .from(skillsTable)
      .orderBy(
        desc(skillsTable.rating),
        asc(skillsTable.sortOrder),
        asc(skillsTable.id)
      );
    if (rows.length === 0) {
      return DEFAULT_SKILLS.map(toDisplaySkill);
    }
    return rows.map(toDisplaySkill);
  } catch {
    return DEFAULT_SKILLS.map(toDisplaySkill);
  }
}

/** Top N for the home page's featured section (mirrors `featuredSkills`). */
export async function getFeaturedSkills(limit = 6): Promise<skillsInterface[]> {
  const all = await getPublicSkills();
  return all.slice(0, limit);
}
