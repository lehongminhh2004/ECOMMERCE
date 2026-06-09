import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "discount_label" varchar,
      ADD COLUMN IF NOT EXISTS "discount_percent" numeric,
      ADD COLUMN IF NOT EXISTS "expires_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "coupon_code" varchar;

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

    CREATE INDEX IF NOT EXISTS "posts_discount_percent_idx"
      ON "posts" USING btree ("discount_percent");

    CREATE INDEX IF NOT EXISTS "posts_expires_at_idx"
      ON "posts" USING btree ("expires_at");

    CREATE INDEX IF NOT EXISTS "pages_blocks_blog_posts_order_idx"
      ON "pages_blocks_blog_posts" USING btree ("_order");

    CREATE INDEX IF NOT EXISTS "pages_blocks_blog_posts_parent_id_idx"
      ON "pages_blocks_blog_posts" USING btree ("_parent_id");

    CREATE INDEX IF NOT EXISTS "pages_blocks_blog_posts_path_idx"
      ON "pages_blocks_blog_posts" USING btree ("_path");

    CREATE UNIQUE INDEX IF NOT EXISTS "pages_blocks_blog_posts_locales_locale_parent_unique"
      ON "pages_blocks_blog_posts_locales" USING btree ("_locale", "_parent_id");

    DO $$
    DECLARE
      deals_page_id integer;
      summer_page_id integer;
      deals_posts_block_id varchar;
      summer_hero_block_id varchar;
      summer_posts_block_id varchar;
    BEGIN
      INSERT INTO "pages" ("slug", "updated_at", "created_at")
      SELECT 'deals', now(), now()
      WHERE NOT EXISTS (SELECT 1 FROM "pages" WHERE "slug" = 'deals')
      RETURNING "id" INTO deals_page_id;

      IF deals_page_id IS NULL THEN
        SELECT "id" INTO deals_page_id FROM "pages" WHERE "slug" = 'deals';
      END IF;

      INSERT INTO "pages_locales" ("title", "_locale", "_parent_id")
      VALUES
        ('Deals', 'en', deals_page_id),
        ('Ưu đãi', 'vi', deals_page_id)
      ON CONFLICT ("_locale", "_parent_id") DO NOTHING;

      deals_posts_block_id := 'seed_deals_posts_' || deals_page_id;
      IF NOT EXISTS (
        SELECT 1 FROM "pages_blocks_blog_posts"
        WHERE "_parent_id" = deals_page_id AND "_path" = 'layout'
      ) THEN
        INSERT INTO "pages_blocks_blog_posts"
          ("_order", "_parent_id", "_path", "id", "limit", "block_name")
        VALUES
          (0, deals_page_id, 'layout', deals_posts_block_id, 8, NULL);

        INSERT INTO "pages_blocks_blog_posts_locales" ("title", "_locale", "_parent_id")
        VALUES
          ('Latest Deals', 'en', deals_posts_block_id),
          ('Ưu đãi mới nhất', 'vi', deals_posts_block_id)
        ON CONFLICT ("_locale", "_parent_id") DO NOTHING;
      END IF;

      INSERT INTO "pages" ("slug", "updated_at", "created_at")
      SELECT 'summer-sale', now(), now()
      WHERE NOT EXISTS (SELECT 1 FROM "pages" WHERE "slug" = 'summer-sale')
      RETURNING "id" INTO summer_page_id;

      IF summer_page_id IS NULL THEN
        SELECT "id" INTO summer_page_id FROM "pages" WHERE "slug" = 'summer-sale';
      END IF;

      INSERT INTO "pages_locales" ("title", "_locale", "_parent_id")
      VALUES
        ('Summer Sale', 'en', summer_page_id),
        ('Khuyến mãi hè', 'vi', summer_page_id)
      ON CONFLICT ("_locale", "_parent_id") DO NOTHING;

      summer_hero_block_id := 'seed_summer_hero_' || summer_page_id;
      IF NOT EXISTS (
        SELECT 1 FROM "pages_blocks_hero"
        WHERE "_parent_id" = summer_page_id AND "_path" = 'layout'
      ) THEN
        INSERT INTO "pages_blocks_hero"
          ("_order", "_parent_id", "_path", "id", "background_image_id", "cta_link", "block_name")
        VALUES
          (0, summer_page_id, 'layout', summer_hero_block_id, NULL, '/search', NULL);

        INSERT INTO "pages_blocks_hero_locales" ("title", "subtitle", "cta_text", "_locale", "_parent_id")
        VALUES
          ('Summer Sale', 'Seasonal offers and limited-time promotions.', 'Shop now', 'en', summer_hero_block_id),
          ('Khuyến mãi hè', 'Ưu đãi theo mùa và các khuyến mãi có thời hạn.', 'Mua ngay', 'vi', summer_hero_block_id)
        ON CONFLICT ("_locale", "_parent_id") DO NOTHING;
      END IF;

      summer_posts_block_id := 'seed_summer_posts_' || summer_page_id;
      IF NOT EXISTS (
        SELECT 1 FROM "pages_blocks_blog_posts"
        WHERE "_parent_id" = summer_page_id AND "_path" = 'layout'
      ) THEN
        INSERT INTO "pages_blocks_blog_posts"
          ("_order", "_parent_id", "_path", "id", "limit", "block_name")
        VALUES
          (1, summer_page_id, 'layout', summer_posts_block_id, 8, NULL);

        INSERT INTO "pages_blocks_blog_posts_locales" ("title", "_locale", "_parent_id")
        VALUES
          ('Summer Deals', 'en', summer_posts_block_id),
          ('Ưu đãi mùa hè', 'vi', summer_posts_block_id)
        ON CONFLICT ("_locale", "_parent_id") DO NOTHING;
      END IF;
    END $$;
  `)

  payload.logger.info('Migration: fixed promotion content schema')
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "pages_blocks_blog_posts_locales" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_blog_posts" CASCADE;
    DROP INDEX IF EXISTS "posts_discount_percent_idx";
    DROP INDEX IF EXISTS "posts_expires_at_idx";
    ALTER TABLE "posts"
      DROP COLUMN IF EXISTS "discount_label",
      DROP COLUMN IF EXISTS "discount_percent",
      DROP COLUMN IF EXISTS "expires_at";
  `)

  payload.logger.info('Migration: reverted promotion content schema fix')
}
