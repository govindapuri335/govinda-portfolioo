import "server-only";

import { desc, eq, sql as sqlOp } from "drizzle-orm";

import { db } from "@/db/client";
import { contactSubmissions, type ContactSubmission } from "@/db/schema";

export interface ContactSocial {
  platform: string;
  value: string;
}

export interface ContactSubmissionInput {
  name: string;
  email: string;
  message: string;
  socials?: ContactSocial[];
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Parsed view of a contact submission — decodes the JSON `socials` column
 * back into an array for UI consumers. Falls back to `[]` on any decode
 * failure so a malformed row never breaks the admin list.
 */
export interface ContactSubmissionView
  extends Omit<ContactSubmission, "socials"> {
  socials: ContactSocial[];
}

function parseSocials(raw: string | null): ContactSocial[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (s): s is ContactSocial =>
          s && typeof s === "object" && typeof s.platform === "string"
      )
      .map((s) => ({ platform: String(s.platform), value: String(s.value ?? "") }));
  } catch {
    return [];
  }
}

function toView(row: ContactSubmission): ContactSubmissionView {
  return { ...row, socials: parseSocials(row.socials) };
}

/**
 * Insert a new submission. `socials` is serialized to JSON so we don't need a
 * child table.
 */
export async function createContactSubmission(
  input: ContactSubmissionInput
): Promise<ContactSubmission> {
  const socialsJson =
    input.socials && input.socials.length > 0
      ? JSON.stringify(
          input.socials.filter(
            (s) => (s.platform || s.value)?.toString().trim() !== ""
          )
        )
      : null;

  const [created] = await db
    .insert(contactSubmissions)
    .values({
      name: input.name,
      email: input.email,
      message: input.message,
      socials: socialsJson,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning();
  return created;
}

/**
 * Return all submissions newest-first. Used by /admin/contacts.
 */
export async function listContactSubmissions(): Promise<ContactSubmissionView[]> {
  const rows = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt), desc(contactSubmissions.id));
  return rows.map(toView);
}

export async function getContactSubmissionById(
  id: number
): Promise<ContactSubmissionView | null> {
  const rows = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .limit(1);
  return rows[0] ? toView(rows[0]) : null;
}

export async function setContactRead(
  id: number,
  read: boolean
): Promise<ContactSubmissionView | null> {
  const [updated] = await db
    .update(contactSubmissions)
    .set({ read })
    .where(eq(contactSubmissions.id, id))
    .returning();
  return updated ? toView(updated) : null;
}

export async function deleteContactSubmission(id: number): Promise<boolean> {
  const rows = await db
    .delete(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .returning();
  return rows.length > 0;
}

/**
 * Counts used by the admin dashboard card.
 */
export async function getContactCounts(): Promise<{
  total: number;
  unread: number;
}> {
  const [row] = await db
    .select({
      total: sqlOp<number>`COUNT(*)::int`,
      unread: sqlOp<number>`COUNT(*) FILTER (WHERE ${contactSubmissions.read} = false)::int`,
    })
    .from(contactSubmissions);
  return {
    total: Number(row?.total ?? 0),
    unread: Number(row?.unread ?? 0),
  };
}
