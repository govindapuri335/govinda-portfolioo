CREATE TABLE "about_page" (
	"id" serial PRIMARY KEY NOT NULL,
	"intro_paragraphs" text[] DEFAULT '{}' NOT NULL,
	"community_title" text DEFAULT 'Community Involvement' NOT NULL,
	"community_items" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
