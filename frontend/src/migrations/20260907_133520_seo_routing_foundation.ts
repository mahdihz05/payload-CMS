import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_seo_redirects_source_locale" AS ENUM('fa', 'en', 'ar-ae');
  CREATE TYPE "public"."enum_seo_redirects_to_type" AS ENUM('content', 'url');
  CREATE TYPE "public"."enum_seo_redirects_to_locale" AS ENUM('fa', 'en', 'ar-ae');
  CREATE TYPE "public"."enum_seo_redirects_status" AS ENUM('308', '307');
  CREATE TABLE "seo_redirects" (
    "id" serial PRIMARY KEY NOT NULL,
    "source_locale" "enum_seo_redirects_source_locale" NOT NULL,
    "source_path" varchar,
    "source_key" varchar NOT NULL,
    "to_type" "enum_seo_redirects_to_type" DEFAULT 'content' NOT NULL,
    "to_content_id" integer,
    "to_locale" "enum_seo_redirects_to_locale",
    "to_url" varchar,
    "status" "enum_seo_redirects_status" DEFAULT '308' NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "reason" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "seo_redirects_id" integer;
  ALTER TABLE "seo_redirects" ADD CONSTRAINT "seo_redirects_to_content_id_content_id_fk" FOREIGN KEY ("to_content_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "seo_redirects_source_locale_idx" ON "seo_redirects" USING btree ("source_locale");
  CREATE INDEX "seo_redirects_source_path_idx" ON "seo_redirects" USING btree ("source_path");
  CREATE UNIQUE INDEX "seo_redirects_source_key_idx" ON "seo_redirects" USING btree ("source_key");
  CREATE INDEX "seo_redirects_to_to_content_idx" ON "seo_redirects" USING btree ("to_content_id");
  CREATE INDEX "seo_redirects_enabled_idx" ON "seo_redirects" USING btree ("enabled");
  CREATE INDEX "seo_redirects_updated_at_idx" ON "seo_redirects" USING btree ("updated_at");
  CREATE INDEX "seo_redirects_created_at_idx" ON "seo_redirects" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_seo_redirects_fk" FOREIGN KEY ("seo_redirects_id") REFERENCES "public"."seo_redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_seo_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("seo_redirects_id");
  CREATE UNIQUE INDEX "content_locale_path_unique" ON "content_locales" USING btree ("path", "_locale") WHERE "path" IS NOT NULL;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_seo_redirects_fk";
  DROP INDEX "payload_locked_documents_rels_seo_redirects_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "seo_redirects_id";
  DROP INDEX "content_locale_path_unique";
  DROP TABLE "seo_redirects" CASCADE;
  DROP TYPE "public"."enum_seo_redirects_source_locale";
  DROP TYPE "public"."enum_seo_redirects_to_type";
  DROP TYPE "public"."enum_seo_redirects_to_locale";
  DROP TYPE "public"."enum_seo_redirects_status";
  `);
}
