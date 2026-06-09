import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION repair_vietnamese_cms_text(input text)
    RETURNS text
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      output text := input;
      old_value text;
      new_value text;
    BEGIN
      IF input IS NULL THEN
        RETURN NULL;
      END IF;

      FOR old_value, new_value IN
        SELECT * FROM (VALUES
          (U&'Khuy\\00E1\\00BA\\00BFn m\\00C3\\00A3i h\\00C3\\00A8', U&'Khuy\\1EBFn m\\00E3i h\\00E8'),
          (U&'\\00C6\\00AFu \\00C4\\2018\\00C3\\00A3i m\\00E1\\00BB\\203Ai nh\\00E1\\00BA\\00A5t', U&'\\01AFu \\0111\\00E3i m\\1EDBi nh\\1EA5t'),
          (U&'\\00C6\\00AFu \\00C4\\2018\\00C3\\00A3i m\\00C3\\00B9a h\\00C3\\00A8', U&'\\01AFu \\0111\\00E3i m\\00F9a h\\00E8'),
          (U&'\\00C6\\00AFu \\00C4\\2018\\00C3\\00A3i theo m\\00C3\\00B9a v\\00C3\\00A0 c\\00C3\\00A1c khuy\\00E1\\00BA\\00BFn m\\00C3\\00A3i c\\00C3\\00B3 th\\00E1\\00BB\\009Di h\\00E1\\00BA\\00A1n.', U&'\\01AFu \\0111\\00E3i theo m\\00F9a v\\00E0 c\\00E1c khuy\\1EBFn m\\00E3i c\\00F3 th\\1EDDi h\\1EA1n.'),
          (U&'\\00C6\\00AFu \\00C4\\2018\\00C3\\00A3i', U&'\\01AFu \\0111\\00E3i'),
          (U&'\\00C6\\00B0u \\00C4\\2018\\00C3\\00A3i', U&'\\01B0u \\0111\\00E3i'),
          (U&'Khuy\\00E1\\00BA\\00BFn m\\00C3\\00A3i', U&'Khuy\\1EBFn m\\00E3i'),
          (U&'M\\00C3\\00A3 gi\\00E1\\00BA\\00A3m gi\\00C3\\00A1', U&'M\\00E3 gi\\1EA3m gi\\00E1'),
          (U&'M\\00C3\\00A3 Gi\\00E1\\00BA\\00A3m Gi\\00C3\\00A1', U&'M\\00E3 Gi\\1EA3m Gi\\00E1'),
          (U&'M\\FFFD? gi?m gi\\FFFD?', U&'M\\00E3 gi\\1EA3m gi\\00E1'),
          (U&'M\\FFFD gi?m gi\\FFFD', U&'M\\00E3 gi\\1EA3m gi\\00E1'),
          (U&'M? gi?m gi?', U&'M\\00E3 gi\\1EA3m gi\\00E1'),
          (U&'Gi\\00E1\\00BA\\00A3m', U&'Gi\\1EA3m'),
          (U&'Gi\\FFFD?m', U&'Gi\\1EA3m'),
          (U&'Gi?m', U&'Gi\\1EA3m'),
          (U&'Xem s?n ph?m', U&'Xem s\\1EA3n ph\\1EA9m')
        ) AS replacements(old_value, new_value)
      LOOP
        output := replace(output, old_value, new_value);
      END LOOP;

      RETURN output;
    END
    $function$;

    UPDATE "pages_locales"
    SET "title" = repair_vietnamese_cms_text("title")
    WHERE "_locale" = 'vi'
      AND "title" IS DISTINCT FROM repair_vietnamese_cms_text("title");

    UPDATE "pages_blocks_hero_locales"
    SET
      "title" = repair_vietnamese_cms_text("title"),
      "subtitle" = repair_vietnamese_cms_text("subtitle"),
      "cta_text" = repair_vietnamese_cms_text("cta_text")
    WHERE "_locale" = 'vi'
      AND (
        "title" IS DISTINCT FROM repair_vietnamese_cms_text("title")
        OR "subtitle" IS DISTINCT FROM repair_vietnamese_cms_text("subtitle")
        OR "cta_text" IS DISTINCT FROM repair_vietnamese_cms_text("cta_text")
      );

    UPDATE "pages_blocks_blog_posts_locales"
    SET "title" = repair_vietnamese_cms_text("title")
    WHERE "_locale" = 'vi'
      AND "title" IS DISTINCT FROM repair_vietnamese_cms_text("title");

    UPDATE "posts_locales"
    SET
      "title" = repair_vietnamese_cms_text("title"),
      "discount_label" = repair_vietnamese_cms_text("discount_label")
    WHERE "_locale" = 'vi'
      AND (
        "title" IS DISTINCT FROM repair_vietnamese_cms_text("title")
        OR "discount_label" IS DISTINCT FROM repair_vietnamese_cms_text("discount_label")
      );

    DROP FUNCTION repair_vietnamese_cms_text(text);
  `)

  payload.logger.info('Migration: repaired Vietnamese CMS text encoding')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('Migration: Vietnamese CMS text repair is not reversible')
}
