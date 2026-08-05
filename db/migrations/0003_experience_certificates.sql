CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"date" text NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"bullets" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "experiences_sort_order_idx" ON "experiences" USING btree ("sort_order");
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"issuer" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"image_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "certificates_sort_order_idx" ON "certificates" USING btree ("sort_order");
