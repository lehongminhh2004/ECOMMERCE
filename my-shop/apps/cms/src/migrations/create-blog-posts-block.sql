CREATE TABLE IF NOT EXISTS "pages_blocks_blog_posts" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "limit" numeric,
  "block_name" varchar
);

CREATE TABLE IF NOT EXISTS "pages_blocks_blog_posts_locales" (
  "title" varchar NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "_locale" "_locales" NOT NULL,
  "_parent_id" varchar NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_blog_posts_parent_id_fk'
  ) THEN
    ALTER TABLE "pages_blocks_blog_posts"
      ADD CONSTRAINT "pages_blocks_blog_posts_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_blog_posts_locales_parent_id_fk'
  ) THEN
    ALTER TABLE "pages_blocks_blog_posts_locales"
      ADD CONSTRAINT "pages_blocks_blog_posts_locales_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_blog_posts"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "pages_blocks_blog_posts_order_idx"
  ON "pages_blocks_blog_posts" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "pages_blocks_blog_posts_parent_id_idx"
  ON "pages_blocks_blog_posts" USING btree ("_parent_id");

CREATE INDEX IF NOT EXISTS "pages_blocks_blog_posts_path_idx"
  ON "pages_blocks_blog_posts" USING btree ("_path");

CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_blog_posts_locales_locale_parent_unique"
  ON "pages_blocks_blog_posts_locales" USING btree ("_locale", "_parent_id");
