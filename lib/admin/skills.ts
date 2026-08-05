import "server-only";

import { asc, desc, eq, sql as sqlOp } from "drizzle-orm";

import { db } from "@/db/client";
import { skills, type Skill } from "@/db/schema";

/**
 * The original static skills list. Used to auto-seed the `skills` table on
 * first read so nothing is lost when migrating from `config/skills.ts`.
 * Icon keys correspond to entries in the central `Icons` registry
 * (see `components/common/icons.tsx`).
 */
export const DEFAULT_SKILLS: {
  name: string;
  description: string;
  rating: number;
  iconKey: string;
}[] = [
  {
    name: "Credit Analysis",
    description:
      "Evaluate borrower strength, deal structure, and repayment risk across equipment finance requests.",
    rating: 5,
    iconKey: "billing",
  },
  {
    name: "Financial Statement Review",
    description:
      "Read income statements, balance sheets, and cash flow statements to find trends and risk signals.",
    rating: 5,
    iconKey: "post",
  },
  {
    name: "Cash Flow Analysis",
    description:
      "Measure monthly cash performance and repayment capacity from bank statements and operating activity.",
    rating: 5,
    iconKey: "calendar",
  },
  {
    name: "Business Credit",
    description:
      "Review business credit history, payment patterns, and overall credit behavior across applicants and guarantors.",
    rating: 5,
    iconKey: "userFill",
  },
  {
    name: "PayNet",
    description:
      "Use PayNet history to understand prior leasing behavior, payment performance, and trade trends.",
    rating: 4,
    iconKey: "link",
  },
  {
    name: "UCC Review",
    description:
      "Check UCC filings to understand collateral position and potential lien conflicts.",
    rating: 4,
    iconKey: "page",
  },
  {
    name: "Risk Assessment",
    description:
      "Identify repayment, concentration, and structure risks before lender submissions move forward.",
    rating: 5,
    iconKey: "warning",
  },
];

/**
 * Return all skills sorted the same way the public site expects: highest
 * rating first, then insertion order (sortOrder asc, id asc) as tiebreakers.
 *
 * On first call after migration the table is empty — we seed it from
 * `DEFAULT_SKILLS` inside a small idempotent block so the public /skills
 * page never renders empty.
 */
export async function listSkills(): Promise<Skill[]> {
  const rows = await db
    .select()
    .from(skills)
    .orderBy(desc(skills.rating), asc(skills.sortOrder), asc(skills.id));
  if (rows.length > 0) return rows;

  // Empty table → seed once. Use a guarded insert so a concurrent request
  // running the same seed doesn't create duplicates.
  await db
    .insert(skills)
    .values(
      DEFAULT_SKILLS.map((s, i) => ({
        name: s.name,
        description: s.description,
        rating: s.rating,
        iconKey: s.iconKey,
        sortOrder: i,
      }))
    )
    .onConflictDoNothing();

  return db
    .select()
    .from(skills)
    .orderBy(desc(skills.rating), asc(skills.sortOrder), asc(skills.id));
}

export async function getSkillById(id: number): Promise<Skill | null> {
  const rows = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface SkillInput {
  name: string;
  description: string;
  rating: number;
  iconKey: string;
}

export async function createSkill(input: SkillInput): Promise<Skill> {
  // Place new skills at the end (highest sortOrder + 1).
  const [{ max }] = await db
    .select({ max: sqlOp<number>`COALESCE(MAX(${skills.sortOrder}), -1)` })
    .from(skills);

  const [created] = await db
    .insert(skills)
    .values({
      name: input.name,
      description: input.description,
      rating: input.rating,
      iconKey: input.iconKey,
      sortOrder: (max ?? -1) + 1,
    })
    .returning();
  return created;
}

export async function updateSkill(
  id: number,
  patch: Partial<SkillInput>
): Promise<Skill | null> {
  const existing = await getSkillById(id);
  if (!existing) return null;
  const [updated] = await db
    .update(skills)
    .set({
      name: patch.name ?? existing.name,
      description: patch.description ?? existing.description,
      rating: patch.rating ?? existing.rating,
      iconKey: patch.iconKey ?? existing.iconKey,
      updatedAt: new Date(),
    })
    .where(eq(skills.id, id))
    .returning();
  return updated;
}

export async function deleteSkill(id: number): Promise<boolean> {
  const rows = await db.delete(skills).where(eq(skills.id, id)).returning();
  return rows.length > 0;
}
