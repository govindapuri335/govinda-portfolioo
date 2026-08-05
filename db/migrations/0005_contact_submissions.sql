CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"socials" text,
	"read" boolean DEFAULT false NOT NULL,
	"ip" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" ("created_at");
--> statement-breakpoint
CREATE INDEX "contact_submissions_read_idx" ON "contact_submissions" ("read");
