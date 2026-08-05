import { Icons } from "@/components/common/icons";

/**
 * Curated list of icon keys shown in the admin "Add skill" icon picker.
 *
 * Scoped to icons that are meaningful for skills a credit analyst, investor,
 * or accountant would list — money, banking, charts, audit/compliance,
 * documents, deals, and general finance-relevant utility icons.
 *
 * If you want to expose a new icon in the picker, add it here and (if it
 * doesn't already exist) register it in `Icons`.
 */
export const SKILL_ICON_KEYS = [
  // Money / currency
  "billing", // CreditCard
  "banknote",
  "coins",
  "dollarSign",
  "wallet",
  "piggyBank",

  // Banking / institutions / business
  "landmark",
  "building2",
  "briefcase",
  "work", // HiBriefcase (alt briefcase)

  // Accounting / calculation
  "calculator",
  "receipt",
  "percent",
  "scale",

  // Charts / analysis / trends
  "barChart",
  "lineChart",
  "pieChart",
  "chartCandlestick",
  "trendingUp",
  "trendingDown",
  "activity",

  // Documents / spreadsheets / ledgers
  "post", // FileText
  "page", // File
  "fileSpreadsheet",
  "fileCheck",
  "fileSearch",
  "clipboardList",
  "bookOpen",
  "signature",

  // Compliance / audit / risk / legal
  "shieldCheck",
  "gavel",
  "warning",
  "check",

  // Deals / relationships / goals / recognition
  "handshake",
  "target",
  "award",
  "star",

  // People / clients
  "user",
  "userFill",
  "users",
  "contact",

  // Time / scheduling
  "calendar",
  "clock",

  // Research / info / links
  "search",
  "filter",
  "link",
  "externalLink",
  "infoMark",
  "questionMark",
] as const satisfies readonly (keyof typeof Icons)[];

export type SkillIconKey = (typeof SKILL_ICON_KEYS)[number];

/** Set for O(1) validation on the server. */
const SKILL_ICON_SET = new Set<string>(SKILL_ICON_KEYS);

export function isSkillIconKey(v: unknown): v is SkillIconKey {
  return typeof v === "string" && SKILL_ICON_SET.has(v);
}

/**
 * Resolve a string key into a renderable icon component. Falls back to
 * `Icons.billing` if the key is unknown, so the UI never crashes on
 * stale/legacy data.
 */
export function getIcon(
  key: string | null | undefined
): (typeof Icons)[keyof typeof Icons] {
  if (key && key in Icons) {
    return Icons[key as keyof typeof Icons];
  }
  return Icons.billing;
}

/** Default icon used when nothing is selected yet. */
export const DEFAULT_SKILL_ICON_KEY: SkillIconKey = "billing";
