CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"content_html" text DEFAULT '' NOT NULL,
	"content_json" text,
	"cover_image" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"reading_time" integer DEFAULT 1 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "posts_published_date_idx" ON "posts" USING btree ("published","date");--> statement-breakpoint
CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");