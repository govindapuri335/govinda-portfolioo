import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * About page editable content.
 *
 * Single-row table (enforced via a CHECK on `singleton` = true). Stores the two
 * editable sections currently rendered on the public /about page:
 *   1. Intro paragraphs (bio prose).
 *   2. Community involvement (heading + bullet list).
 *
 * Arrays use Postgres text[] so ordering is preserved and items are trivial to
 * edit/reorder in the admin UI.
 */
export const aboutPage = pgTable("about_page", {
  id: serial("id").primaryKey(),
  introParagraphs: text("intro_paragraphs").array().notNull().default([]),
  communityTitle: text("community_title")
    .notNull()
    .default("Community Involvement"),
  communityItems: text("community_items").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AboutPage = typeof aboutPage.$inferSelect;
export type NewAboutPage = typeof aboutPage.$inferInsert;

/**
 * Learning page editable content.
 *
 * Single-row table storing the "Current Focus" and "Certifications & Tools"
 * cards rendered between Professional Experience and Certificates on
 * /experience (and also on the home page's Certifications & Learning band).
 *
 * Kept as a singleton row (like `about_page`) since the shape is fixed: two
 * titled bullet lists. Arrays use text[] to preserve ordering.
 */
export const learningPage = pgTable("learning_page", {
  id: serial("id").primaryKey(),
  currentFocusTitle: text("current_focus_title")
    .notNull()
    .default("Current Focus"),
  currentFocusBullets: text("current_focus_bullets")
    .array()
    .notNull()
    .default([]),
  certificationsTitle: text("certifications_title")
    .notNull()
    .default("Certifications & Tools"),
  certificationsBullets: text("certifications_bullets")
    .array()
    .notNull()
    .default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LearningPage = typeof learningPage.$inferSelect;
export type NewLearningPage = typeof learningPage.$inferInsert;

/**
 * Skills displayed on /skills and the home page.
 *
 * `iconKey` stores a string key into the central `Icons` registry
 * (`components/common/icons.tsx`) — icons cannot be persisted as React
 * components, so we resolve the key back to a component at render time via
 * `getIcon(key)`.
 *
 * `sortOrder` preserves display order across edits (lower first). Existing
 * behavior sorts by `rating` desc; that is retained at the query layer so
 * `sortOrder` is only used to break ties predictably.
 */
export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    rating: integer("rating").notNull(),
    iconKey: varchar("icon_key", { length: 64 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    ratingIdx: index("skills_rating_idx").on(t.rating),
  })
);

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;

/**
 * Professional experience entries rendered on /experience.
 *
 * Mirrors the shape of `ExperienceRole` from `config/experience.ts`. Bullet
 * points are stored as an ordered `text[]` so the admin UI can add / remove /
 * reorder them without any join table.
 *
 * `sortOrder` controls the display order on the public page (ascending — the
 * most recent role should have the lowest value).
 */
export const experiences = pgTable(
  "experiences",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    date: text("date").notNull(),
    location: text("location").notNull(),
    description: text("description"),
    bullets: text("bullets").array().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sortOrderIdx: index("experiences_sort_order_idx").on(t.sortOrder),
  })
);

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;

/**
 * Certificates displayed in the /experience page carousel.
 *
 * Each row is a single certificate image (Cloudinary URL) plus optional
 * metadata used for accessibility and the caption strip on the slider. The
 * carousel auto-advances but also supports manual prev/next controls.
 *
 * `sortOrder` determines slide order (ascending). Lower values appear first.
 */
export const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    issuer: text("issuer").notNull().default(""),
    date: text("date").notNull().default(""),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sortOrderIdx: index("certificates_sort_order_idx").on(t.sortOrder),
  })
);

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

/**
 * Blog posts table.
 *
 * Notes:
 * - `slug` is unique and URL-safe.
 * - `contentHtml` stores the rendered/sanitized HTML from the WYSIWYG editor.
 * - `contentJson` stores the raw Tiptap JSON so the editor can round-trip
 *   without any lossy HTML → JSON conversion when editing.
 * - `published` gates visibility on the public site. Drafts are admin-only.
 * - `date` is the author-facing publish date (may differ from createdAt).
 */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    contentHtml: text("content_html").notNull().default(""),
    contentJson: text("content_json"),
    coverImage: text("cover_image"),
    tags: text("tags").array().notNull().default([]),
    readingTime: integer("reading_time").notNull().default(1),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    publishedDateIdx: index("posts_published_date_idx").on(
      t.published,
      t.date
    ),
    slugIdx: index("posts_slug_idx").on(t.slug),
  })
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

/**
 * Contact form submissions.
 *
 * Every message sent from the public /contact form lands here. The admin
 * dashboard reads this table to list, mark-as-read, and delete messages, so
 * nothing is ever lost even if the email notification pipeline is down.
 *
 * `socials` stores the optional array of {platform, value} pairs as JSON text
 * to avoid an extra join table (the shape is user-authored and unbounded).
 * `read` toggles the "unread badge" in /admin/contacts. `ip` and `userAgent`
 * are captured for basic abuse triage — never displayed to the public.
 */
export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    socials: text("socials"),
    read: boolean("read").notNull().default(false),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    createdAtIdx: index("contact_submissions_created_at_idx").on(t.createdAt),
    readIdx: index("contact_submissions_read_idx").on(t.read),
  })
);

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;
