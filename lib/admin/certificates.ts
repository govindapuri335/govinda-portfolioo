import "server-only";

import { asc, eq, sql as sqlOp } from "drizzle-orm";

import { db } from "@/db/client";
import { certificates, type Certificate } from "@/db/schema";

/**
 * List certificates in slide order (sortOrder asc, then id asc as a stable
 * tiebreaker). No auto-seeding — this table starts empty and is filled from
 * the admin UI.
 */
export async function listCertificates(): Promise<Certificate[]> {
  return db
    .select()
    .from(certificates)
    .orderBy(asc(certificates.sortOrder), asc(certificates.id));
}

export async function getCertificateById(
  id: number
): Promise<Certificate | null> {
  const rows = await db
    .select()
    .from(certificates)
    .where(eq(certificates.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export interface CertificateInput {
  title: string;
  issuer?: string;
  date?: string;
  imageUrl: string;
}

export async function createCertificate(
  input: CertificateInput
): Promise<Certificate> {
  const [{ max }] = await db
    .select({
      max: sqlOp<number>`COALESCE(MAX(${certificates.sortOrder}), -1)`,
    })
    .from(certificates);

  const [created] = await db
    .insert(certificates)
    .values({
      title: input.title,
      issuer: input.issuer ?? "",
      date: input.date ?? "",
      imageUrl: input.imageUrl,
      sortOrder: (max ?? -1) + 1,
    })
    .returning();
  return created;
}

export async function updateCertificate(
  id: number,
  patch: Partial<CertificateInput> & { sortOrder?: number }
): Promise<Certificate | null> {
  const existing = await getCertificateById(id);
  if (!existing) return null;
  const [updated] = await db
    .update(certificates)
    .set({
      title: patch.title ?? existing.title,
      issuer: patch.issuer ?? existing.issuer,
      date: patch.date ?? existing.date,
      imageUrl: patch.imageUrl ?? existing.imageUrl,
      sortOrder: patch.sortOrder ?? existing.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(certificates.id, id))
    .returning();
  return updated;
}

export async function deleteCertificate(id: number): Promise<boolean> {
  const rows = await db
    .delete(certificates)
    .where(eq(certificates.id, id))
    .returning();
  return rows.length > 0;
}
