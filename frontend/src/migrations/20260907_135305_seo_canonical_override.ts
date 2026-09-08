import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "content_locales" ADD COLUMN "seo_canonical_override_enabled" boolean DEFAULT false;
  ALTER TABLE "_content_v_locales" ADD COLUMN "version_seo_canonical_override_enabled" boolean DEFAULT false;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "content_locales" DROP COLUMN "seo_canonical_override_enabled";
  ALTER TABLE "_content_v_locales" DROP COLUMN "version_seo_canonical_override_enabled";
  `);
}
