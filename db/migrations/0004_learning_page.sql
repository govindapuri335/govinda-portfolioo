CREATE TABLE "learning_page" (
	"id" serial PRIMARY KEY NOT NULL,
	"current_focus_title" text DEFAULT 'Current Focus' NOT NULL,
	"current_focus_bullets" text[] DEFAULT '{}' NOT NULL,
	"certifications_title" text DEFAULT 'Certifications & Tools' NOT NULL,
	"certifications_bullets" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
