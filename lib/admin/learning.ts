import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { learningPage, type LearningPage } from "@/db/schema";
import { learningSections as defaultLearningSections } from "@/config/experience";

/**
 * Defaults for the two learning cards. Sourced from the static config so the
 * public site never renders empty on a fresh DB.
 */
const defaults = {
  currentFocusTitle:
    defaultLearningSections[0]?.title ?? "Current Focus",
  currentFocusBullets: [...(defaultLearningSections[0]?.bullets ?? [])],
  certificationsTitle:
    defaultLearningSections[1]?.title ?? "Certifications & Tools",
  certificationsBullets: [...(defaultLearningSections[1]?.bullets ?? [])],
};

/**
 * Return the single Learning row. If missing (fresh DB / first deploy after
 * migration), create it seeded with the current static defaults so both the
 * home page and /experience keep rendering without an empty state.
 *
 * No auth here — the public pages also call this.
 */
export async function getLearning(): Promise<LearningPage> {
  try {
    const rows = await db
      .select()
      .from(learningPage)
      .orderBy(asc(learningPage.id))
      .limit(1);
    if (rows[0]) return rows[0];

    const [inserted] = await db
      .insert(learningPage)
      .values({
        currentFocusTitle: defaults.currentFocusTitle,
        currentFocusBullets: defaults.currentFocusBullets,
        certificationsTitle: defaults.certificationsTitle,
        certificationsBullets: defaults.certificationsBullets,
      })
      .returning();
    return inserted;
  } catch {
    // DB unreachable (e.g. during the static build) — return static defaults
    // so the page never renders empty. ISR fills in real data at runtime.
    return {
      id: 0,
      currentFocusTitle: defaults.currentFocusTitle,
      currentFocusBullets: [...defaults.currentFocusBullets],
      certificationsTitle: defaults.certificationsTitle,
      certificationsBullets: [...defaults.certificationsBullets],
      updatedAt: new Date(),
    };
  }
}

export interface LearningUpdate {
  currentFocusTitle?: string;
  currentFocusBullets?: string[];
  certificationsTitle?: string;
  certificationsBullets?: string[];
}

/** Persist an edit from the admin UI. Fields left undefined are preserved. */
export async function updateLearning(
  patch: LearningUpdate
): Promise<LearningPage> {
  const existing = await getLearning();
  const [updated] = await db
    .update(learningPage)
    .set({
      currentFocusTitle:
        patch.currentFocusTitle ?? existing.currentFocusTitle,
      currentFocusBullets:
        patch.currentFocusBullets ?? existing.currentFocusBullets,
      certificationsTitle:
        patch.certificationsTitle ?? existing.certificationsTitle,
      certificationsBullets:
        patch.certificationsBullets ?? existing.certificationsBullets,
      updatedAt: new Date(),
    })
    .where(eq(learningPage.id, existing.id))
    .returning();
  return updated;
}
