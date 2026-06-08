import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
    ADD COLUMN IF NOT EXISTS "coupon_code" varchar;
  `)
  
  payload.logger.info('Migration: Added coupon_code column to posts table')
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
    DROP COLUMN IF EXISTS "coupon_code";
  `)
  
  payload.logger.info('Migration: Removed coupon_code column from posts table')
}
