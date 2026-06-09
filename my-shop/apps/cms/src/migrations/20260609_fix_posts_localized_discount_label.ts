import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts_locales"
      ADD COLUMN IF NOT EXISTS "discount_label" varchar;
  `)

  payload.logger.info('Migration: added localized discount_label column to posts_locales')
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts_locales"
      DROP COLUMN IF EXISTS "discount_label";
  `)

  payload.logger.info('Migration: removed localized discount_label column from posts_locales')
}
