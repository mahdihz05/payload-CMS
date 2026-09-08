import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fa', 'ar-ae');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'seo', 'viewer');
  CREATE TYPE "public"."enum_content_blocks_hero_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_blocks_rich_text_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_blocks_feature_grid_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_blocks_faq_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_blocks_testimonials_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_blocks_cta_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_blocks_form_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum_content_kind" AS ENUM('page', 'service', 'solution', 'knowledge', 'news');
  CREATE TYPE "public"."enum_content_translation_status" AS ENUM('missing', 'draft', 'translated', 'reviewed', 'outdated');
  CREATE TYPE "public"."enum_content_workflow_status" AS ENUM('draft', 'review', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_content_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__content_v_blocks_hero_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_blocks_rich_text_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_blocks_feature_grid_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_blocks_faq_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_blocks_testimonials_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_blocks_cta_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_blocks_form_variant" AS ENUM('default', 'simple', 'centered', 'split', 'cards', 'compact');
  CREATE TYPE "public"."enum__content_v_version_kind" AS ENUM('page', 'service', 'solution', 'knowledge', 'news');
  CREATE TYPE "public"."enum__content_v_published_locale" AS ENUM('en', 'fa', 'ar-ae');
  CREATE TYPE "public"."enum__content_v_version_translation_status" AS ENUM('missing', 'draft', 'translated', 'reviewed', 'outdated');
  CREATE TYPE "public"."enum__content_v_version_workflow_status" AS ENUM('draft', 'review', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__content_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_forms_fields_field_type" AS ENUM('text', 'textarea', 'email', 'phone', 'number', 'select', 'multi-select', 'radio', 'checkbox', 'date', 'datetime', 'url', 'file', 'hidden');
  CREATE TYPE "public"."enum_form_submissions_locale" AS ENUM('en', 'fa', 'ar-ae');
  CREATE TYPE "public"."enum_form_submissions_status" AS ENUM('new', 'contacted', 'qualified', 'closed');
  CREATE TYPE "public"."enum_form_submissions_priority" AS ENUM('low', 'normal', 'high', 'urgent');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "role" "enum_users_role" DEFAULT 'viewer' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "legacy_i_d" varchar,
    "is_public" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_thumbnail_url" varchar,
    "sizes_thumbnail_width" numeric,
    "sizes_thumbnail_height" numeric,
    "sizes_thumbnail_mime_type" varchar,
    "sizes_thumbnail_filesize" numeric,
    "sizes_thumbnail_filename" varchar,
    "sizes_card_url" varchar,
    "sizes_card_width" numeric,
    "sizes_card_height" numeric,
    "sizes_card_mime_type" varchar,
    "sizes_card_filesize" numeric,
    "sizes_card_filename" varchar,
    "sizes_hero_url" varchar,
    "sizes_hero_width" numeric,
    "sizes_hero_height" numeric,
    "sizes_hero_mime_type" varchar,
    "sizes_hero_filesize" numeric,
    "sizes_hero_filename" varchar
  );

  CREATE TABLE "media_locales" (
    "alt" varchar NOT NULL,
    "title" varchar,
    "caption" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "content_blocks_hero_points" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar
  );

  CREATE TABLE "content_blocks_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_hero_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "title" varchar,
    "highlight" varchar,
    "body" varchar,
    "primary_c_t_a_label" varchar,
    "primary_c_t_a_url" varchar,
    "primary_c_t_a_open_in_new_tab" boolean DEFAULT false,
    "secondary_c_t_a_label" varchar,
    "secondary_c_t_a_url" varchar,
    "secondary_c_t_a_open_in_new_tab" boolean DEFAULT false,
    "block_name" varchar
  );

  CREATE TABLE "content_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_rich_text_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "block_name" varchar
  );

  CREATE TABLE "content_blocks_feature_grid_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon" varchar,
    "title" varchar,
    "description" varchar,
    "url" varchar
  );

  CREATE TABLE "content_blocks_feature_grid" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_feature_grid_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "heading" varchar,
    "intro" varchar,
    "block_name" varchar
  );

  CREATE TABLE "content_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar
  );

  CREATE TABLE "content_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_faq_variant" DEFAULT 'default',
    "heading" varchar,
    "block_name" varchar
  );

  CREATE TABLE "content_blocks_testimonials_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "quote" varchar,
    "name" varchar,
    "role" varchar,
    "company" varchar
  );

  CREATE TABLE "content_blocks_testimonials" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_testimonials_variant" DEFAULT 'default',
    "heading" varchar,
    "block_name" varchar
  );

  CREATE TABLE "content_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_cta_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "title" varchar,
    "body" varchar,
    "primary_c_t_a_label" varchar,
    "primary_c_t_a_url" varchar,
    "primary_c_t_a_open_in_new_tab" boolean DEFAULT false,
    "block_name" varchar
  );

  CREATE TABLE "content_blocks_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum_content_blocks_form_variant" DEFAULT 'default',
    "form_id" integer,
    "eyebrow" varchar,
    "heading" varchar,
    "intro" varchar,
    "context" varchar,
    "block_name" varchar
  );

  CREATE TABLE "content" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "kind" "enum_content_kind" DEFAULT 'page',
    "template_key" varchar DEFAULT 'default',
    "is_active" boolean DEFAULT true,
    "parent_id" integer,
    "seo_robots_index" boolean DEFAULT true,
    "seo_robots_follow" boolean DEFAULT true,
    "seo_og_image_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "content_locales" (
    "title" varchar,
    "excerpt" varchar,
    "slug" varchar,
    "path" varchar,
    "seo_title" varchar,
    "seo_description" varchar,
    "seo_canonical_u_r_l" varchar,
    "seo_og_title" varchar,
    "seo_og_description" varchar,
    "search_text" varchar,
    "translation_status" "enum_content_translation_status" DEFAULT 'draft',
    "workflow_status" "enum_content_workflow_status" DEFAULT 'draft',
    "legacy_published_at" timestamp(3) with time zone,
    "_status" "enum_content_status" DEFAULT 'draft',
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "content_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "content_id" integer
  );

  CREATE TABLE "_content_v_blocks_hero_points" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_content_v_blocks_hero" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_hero_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "title" varchar,
    "highlight" varchar,
    "body" varchar,
    "primary_c_t_a_label" varchar,
    "primary_c_t_a_url" varchar,
    "primary_c_t_a_open_in_new_tab" boolean DEFAULT false,
    "secondary_c_t_a_label" varchar,
    "secondary_c_t_a_url" varchar,
    "secondary_c_t_a_open_in_new_tab" boolean DEFAULT false,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v_blocks_rich_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_rich_text_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "heading" varchar,
    "body" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v_blocks_feature_grid_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon" varchar,
    "title" varchar,
    "description" varchar,
    "url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_content_v_blocks_feature_grid" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_feature_grid_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "heading" varchar,
    "intro" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v_blocks_faq_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_content_v_blocks_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_faq_variant" DEFAULT 'default',
    "heading" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v_blocks_testimonials_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "quote" varchar,
    "name" varchar,
    "role" varchar,
    "company" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_content_v_blocks_testimonials" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_testimonials_variant" DEFAULT 'default',
    "heading" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_cta_variant" DEFAULT 'default',
    "eyebrow" varchar,
    "title" varchar,
    "body" varchar,
    "primary_c_t_a_label" varchar,
    "primary_c_t_a_url" varchar,
    "primary_c_t_a_open_in_new_tab" boolean DEFAULT false,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v_blocks_form" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT true,
    "variant" "enum__content_v_blocks_form_variant" DEFAULT 'default',
    "form_id" integer,
    "eyebrow" varchar,
    "heading" varchar,
    "intro" varchar,
    "context" varchar,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_content_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_key" varchar,
    "version_kind" "enum__content_v_version_kind" DEFAULT 'page',
    "version_template_key" varchar DEFAULT 'default',
    "version_is_active" boolean DEFAULT true,
    "version_parent_id" integer,
    "version_seo_robots_index" boolean DEFAULT true,
    "version_seo_robots_follow" boolean DEFAULT true,
    "version_seo_og_image_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__content_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_content_v_locales" (
    "version_title" varchar,
    "version_excerpt" varchar,
    "version_slug" varchar,
    "version_path" varchar,
    "version_seo_title" varchar,
    "version_seo_description" varchar,
    "version_seo_canonical_u_r_l" varchar,
    "version_seo_og_title" varchar,
    "version_seo_og_description" varchar,
    "version_search_text" varchar,
    "version_translation_status" "enum__content_v_version_translation_status" DEFAULT 'draft',
    "version_workflow_status" "enum__content_v_version_workflow_status" DEFAULT 'draft',
    "version_legacy_published_at" timestamp(3) with time zone,
    "version__status" "enum__content_v_version_status" DEFAULT 'draft',
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_content_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "content_id" integer
  );

  CREATE TABLE "forms_fields" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "field_type" "enum_forms_fields_field_type" NOT NULL,
    "required" boolean DEFAULT false,
    "min_value" numeric,
    "max_value" numeric,
    "min_length" numeric,
    "max_length" numeric,
    "pattern" varchar,
    "options" jsonb,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "forms_fields_locales" (
    "label" varchar NOT NULL,
    "placeholder" varchar,
    "help_text" varchar,
    "option_labels" jsonb,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "forms" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "is_active" boolean DEFAULT true,
    "requires_privacy_consent" boolean DEFAULT true,
    "retention_months" numeric DEFAULT 12 NOT NULL,
    "success_redirect" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "forms_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "success_message" varchar NOT NULL,
    "consent_label" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "form_submissions" (
    "id" serial PRIMARY KEY NOT NULL,
    "legacy_i_d" varchar,
    "form_id" integer NOT NULL,
    "locale" "enum_form_submissions_locale" NOT NULL,
    "contact_name" varchar,
    "contact_phone" varchar,
    "contact_email" varchar,
    "company" varchar,
    "request_type" varchar,
    "data" jsonb NOT NULL,
    "status" "enum_form_submissions_status" DEFAULT 'new' NOT NULL,
    "priority" "enum_form_submissions_priority" DEFAULT 'normal',
    "assigned_to_id" integer,
    "contacted_at" timestamp(3) with time zone,
    "source_u_r_l" varchar,
    "referrer" varchar,
    "consent_given" boolean DEFAULT false NOT NULL,
    "consent_text" varchar,
    "user_agent" varchar,
    "ip_hash" varchar,
    "expires_at" timestamp(3) with time zone NOT NULL,
    "internal_notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "submission_files" (
    "id" serial PRIMARY KEY NOT NULL,
    "legacy_i_d" varchar,
    "submission_id" integer NOT NULL,
    "original_name" varchar NOT NULL,
    "checksum_s_h_a256" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
  );

  CREATE TABLE "audit_logs" (
    "id" serial PRIMARY KEY NOT NULL,
    "legacy_i_d" varchar,
    "actor_id" integer,
    "actor_type" varchar DEFAULT 'admin' NOT NULL,
    "action" varchar NOT NULL,
    "object_type" varchar NOT NULL,
    "object_i_d" varchar NOT NULL,
    "before" jsonb DEFAULT '{}'::jsonb,
    "after" jsonb DEFAULT '{}'::jsonb,
    "occurred_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "executed_at" timestamp(3) with time zone NOT NULL,
    "completed_at" timestamp(3) with time zone NOT NULL,
    "task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
    "task_i_d" varchar NOT NULL,
    "input" jsonb,
    "output" jsonb,
    "state" "enum_payload_jobs_log_state" NOT NULL,
    "error" jsonb
  );

  CREATE TABLE "payload_jobs" (
    "id" serial PRIMARY KEY NOT NULL,
    "input" jsonb,
    "completed_at" timestamp(3) with time zone,
    "total_tried" numeric DEFAULT 0,
    "has_error" boolean DEFAULT false,
    "error" jsonb,
    "task_slug" "enum_payload_jobs_task_slug",
    "queue" varchar DEFAULT 'default',
    "wait_until" timestamp(3) with time zone,
    "processing" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "content_id" integer,
    "forms_id" integer,
    "form_submissions_id" integer,
    "submission_files_id" integer,
    "audit_logs_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "brand_name" varchar DEFAULT 'Payload CMS Starter' NOT NULL,
    "logo_id" integer,
    "favicon_id" integer,
    "phone" varchar,
    "email" varchar,
    "customer_portal_u_r_l" varchar,
    "external_checkout_u_r_l" varchar,
    "social_links" jsonb,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_locales" (
    "address" varchar,
    "location_label" varchar,
    "default_s_e_o_title" varchar,
    "default_s_e_o_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_site_settings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_brand_name" varchar DEFAULT 'Payload CMS Starter' NOT NULL,
    "version_logo_id" integer,
    "version_favicon_id" integer,
    "version_phone" varchar,
    "version_email" varchar,
    "version_customer_portal_u_r_l" varchar,
    "version_external_checkout_u_r_l" varchar,
    "version_social_links" jsonb,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "_site_settings_v_locales" (
    "version_address" varchar,
    "version_location_label" varchar,
    "version_default_s_e_o_title" varchar,
    "version_default_s_e_o_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "design_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "primary" varchar DEFAULT '#2f6bff' NOT NULL,
    "secondary" varchar DEFAULT '#0b1023' NOT NULL,
    "accent" varchar DEFAULT '#31a9de' NOT NULL,
    "background" varchar DEFAULT '#ffffff' NOT NULL,
    "surface" varchar DEFAULT '#f4f8ff' NOT NULL,
    "foreground" varchar DEFAULT '#172039' NOT NULL,
    "muted" varchar DEFAULT '#667085' NOT NULL,
    "radius_small" numeric DEFAULT 8,
    "radius_medium" numeric DEFAULT 12,
    "radius_large" numeric DEFAULT 20,
    "container_width" numeric DEFAULT 1180,
    "section_spacing" numeric DEFAULT 96,
    "motion_enabled" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "_design_settings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_primary" varchar DEFAULT '#2f6bff' NOT NULL,
    "version_secondary" varchar DEFAULT '#0b1023' NOT NULL,
    "version_accent" varchar DEFAULT '#31a9de' NOT NULL,
    "version_background" varchar DEFAULT '#ffffff' NOT NULL,
    "version_surface" varchar DEFAULT '#f4f8ff' NOT NULL,
    "version_foreground" varchar DEFAULT '#172039' NOT NULL,
    "version_muted" varchar DEFAULT '#667085' NOT NULL,
    "version_radius_small" numeric DEFAULT 8,
    "version_radius_medium" numeric DEFAULT 12,
    "version_radius_large" numeric DEFAULT 20,
    "version_container_width" numeric DEFAULT 1180,
    "version_section_spacing" numeric DEFAULT 96,
    "version_motion_enabled" boolean DEFAULT true,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "navigation_header_children" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "navigation_header_children_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_header" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "navigation_header_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_footer_children" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "navigation_footer_children_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_footer" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "navigation_footer_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_mobile_children" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "navigation_mobile_children_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_mobile" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true
  );

  CREATE TABLE "navigation_mobile_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "_navigation_v_version_header_children" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_header_children_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_navigation_v_version_header" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_header_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_navigation_v_version_footer_children" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_footer_children_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_navigation_v_version_footer" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_footer_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_navigation_v_version_mobile_children" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_mobile_children_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_navigation_v_version_mobile" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "icon_key" varchar,
    "open_in_new_tab" boolean DEFAULT false,
    "enabled" boolean DEFAULT true,
    "_uuid" varchar
  );

  CREATE TABLE "_navigation_v_version_mobile_locales" (
    "title" varchar NOT NULL,
    "description" varchar,
    "path" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_navigation_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_hero_points" ADD CONSTRAINT "content_blocks_hero_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_hero" ADD CONSTRAINT "content_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_rich_text" ADD CONSTRAINT "content_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_feature_grid_items" ADD CONSTRAINT "content_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_feature_grid" ADD CONSTRAINT "content_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_faq_items" ADD CONSTRAINT "content_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_faq" ADD CONSTRAINT "content_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_testimonials_items" ADD CONSTRAINT "content_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_testimonials" ADD CONSTRAINT "content_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_cta" ADD CONSTRAINT "content_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_blocks_form" ADD CONSTRAINT "content_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_blocks_form" ADD CONSTRAINT "content_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content" ADD CONSTRAINT "content_parent_id_content_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content" ADD CONSTRAINT "content_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_locales" ADD CONSTRAINT "content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_rels" ADD CONSTRAINT "content_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_rels" ADD CONSTRAINT "content_rels_content_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_hero_points" ADD CONSTRAINT "_content_v_blocks_hero_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_hero" ADD CONSTRAINT "_content_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_rich_text" ADD CONSTRAINT "_content_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_feature_grid_items" ADD CONSTRAINT "_content_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_feature_grid" ADD CONSTRAINT "_content_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_faq_items" ADD CONSTRAINT "_content_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_faq" ADD CONSTRAINT "_content_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_testimonials_items" ADD CONSTRAINT "_content_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_testimonials" ADD CONSTRAINT "_content_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_cta" ADD CONSTRAINT "_content_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_form" ADD CONSTRAINT "_content_v_blocks_form_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_v_blocks_form" ADD CONSTRAINT "_content_v_blocks_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v" ADD CONSTRAINT "_content_v_parent_id_content_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_v" ADD CONSTRAINT "_content_v_version_parent_id_content_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."content"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_v" ADD CONSTRAINT "_content_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_content_v_locales" ADD CONSTRAINT "_content_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_rels" ADD CONSTRAINT "_content_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_content_v_rels" ADD CONSTRAINT "_content_v_rels_content_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_fields" ADD CONSTRAINT "forms_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_fields_locales" ADD CONSTRAINT "forms_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_fields"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_submission_files_fk" FOREIGN KEY ("submission_files_id") REFERENCES "public"."submission_files"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_favicon_id_media_id_fk" FOREIGN KEY ("version_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_children" ADD CONSTRAINT "navigation_header_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_children_locales" ADD CONSTRAINT "navigation_header_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_locales" ADD CONSTRAINT "navigation_header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_children" ADD CONSTRAINT "navigation_footer_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_children_locales" ADD CONSTRAINT "navigation_footer_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer" ADD CONSTRAINT "navigation_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_locales" ADD CONSTRAINT "navigation_footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_mobile_children" ADD CONSTRAINT "navigation_mobile_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_mobile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_mobile_children_locales" ADD CONSTRAINT "navigation_mobile_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_mobile_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_mobile" ADD CONSTRAINT "navigation_mobile_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_mobile_locales" ADD CONSTRAINT "navigation_mobile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_mobile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_children" ADD CONSTRAINT "_navigation_v_version_header_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_children_locales" ADD CONSTRAINT "_navigation_v_version_header_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_header_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header" ADD CONSTRAINT "_navigation_v_version_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_locales" ADD CONSTRAINT "_navigation_v_version_header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_children" ADD CONSTRAINT "_navigation_v_version_footer_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_children_locales" ADD CONSTRAINT "_navigation_v_version_footer_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_footer_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer" ADD CONSTRAINT "_navigation_v_version_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_locales" ADD CONSTRAINT "_navigation_v_version_footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_mobile_children" ADD CONSTRAINT "_navigation_v_version_mobile_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_mobile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_mobile_children_locales" ADD CONSTRAINT "_navigation_v_version_mobile_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_mobile_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_mobile" ADD CONSTRAINT "_navigation_v_version_mobile_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_mobile_locales" ADD CONSTRAINT "_navigation_v_version_mobile_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_mobile"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "media_legacy_i_d_idx" ON "media" USING btree ("legacy_i_d");
  CREATE INDEX "media_is_public_idx" ON "media" USING btree ("is_public");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "content_blocks_hero_points_order_idx" ON "content_blocks_hero_points" USING btree ("_order");
  CREATE INDEX "content_blocks_hero_points_parent_id_idx" ON "content_blocks_hero_points" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_hero_points_locale_idx" ON "content_blocks_hero_points" USING btree ("_locale");
  CREATE INDEX "content_blocks_hero_order_idx" ON "content_blocks_hero" USING btree ("_order");
  CREATE INDEX "content_blocks_hero_parent_id_idx" ON "content_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_hero_path_idx" ON "content_blocks_hero" USING btree ("_path");
  CREATE INDEX "content_blocks_hero_locale_idx" ON "content_blocks_hero" USING btree ("_locale");
  CREATE INDEX "content_blocks_rich_text_order_idx" ON "content_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "content_blocks_rich_text_parent_id_idx" ON "content_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_rich_text_path_idx" ON "content_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "content_blocks_rich_text_locale_idx" ON "content_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "content_blocks_feature_grid_items_order_idx" ON "content_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "content_blocks_feature_grid_items_parent_id_idx" ON "content_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_feature_grid_items_locale_idx" ON "content_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "content_blocks_feature_grid_order_idx" ON "content_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "content_blocks_feature_grid_parent_id_idx" ON "content_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_feature_grid_path_idx" ON "content_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "content_blocks_feature_grid_locale_idx" ON "content_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "content_blocks_faq_items_order_idx" ON "content_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "content_blocks_faq_items_parent_id_idx" ON "content_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_faq_items_locale_idx" ON "content_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "content_blocks_faq_order_idx" ON "content_blocks_faq" USING btree ("_order");
  CREATE INDEX "content_blocks_faq_parent_id_idx" ON "content_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_faq_path_idx" ON "content_blocks_faq" USING btree ("_path");
  CREATE INDEX "content_blocks_faq_locale_idx" ON "content_blocks_faq" USING btree ("_locale");
  CREATE INDEX "content_blocks_testimonials_items_order_idx" ON "content_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "content_blocks_testimonials_items_parent_id_idx" ON "content_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_testimonials_items_locale_idx" ON "content_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "content_blocks_testimonials_order_idx" ON "content_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "content_blocks_testimonials_parent_id_idx" ON "content_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_testimonials_path_idx" ON "content_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "content_blocks_testimonials_locale_idx" ON "content_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "content_blocks_cta_order_idx" ON "content_blocks_cta" USING btree ("_order");
  CREATE INDEX "content_blocks_cta_parent_id_idx" ON "content_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_cta_path_idx" ON "content_blocks_cta" USING btree ("_path");
  CREATE INDEX "content_blocks_cta_locale_idx" ON "content_blocks_cta" USING btree ("_locale");
  CREATE INDEX "content_blocks_form_order_idx" ON "content_blocks_form" USING btree ("_order");
  CREATE INDEX "content_blocks_form_parent_id_idx" ON "content_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "content_blocks_form_path_idx" ON "content_blocks_form" USING btree ("_path");
  CREATE INDEX "content_blocks_form_locale_idx" ON "content_blocks_form" USING btree ("_locale");
  CREATE INDEX "content_blocks_form_form_idx" ON "content_blocks_form" USING btree ("form_id");
  CREATE UNIQUE INDEX "content_key_idx" ON "content" USING btree ("key");
  CREATE INDEX "content_kind_idx" ON "content" USING btree ("kind");
  CREATE INDEX "content_is_active_idx" ON "content" USING btree ("is_active");
  CREATE INDEX "content_parent_idx" ON "content" USING btree ("parent_id");
  CREATE INDEX "content_seo_seo_og_image_idx" ON "content" USING btree ("seo_og_image_id");
  CREATE INDEX "content_updated_at_idx" ON "content" USING btree ("updated_at");
  CREATE INDEX "content_created_at_idx" ON "content" USING btree ("created_at");
  CREATE INDEX "kind_isActive_idx" ON "content" USING btree ("kind","is_active");
  CREATE INDEX "content_path_idx" ON "content_locales" USING btree ("path","_locale");
  CREATE INDEX "content_search_text_idx" ON "content_locales" USING btree ("search_text","_locale");
  CREATE INDEX "content__status_idx" ON "content_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "content_locales_locale_parent_id_unique" ON "content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "content_rels_order_idx" ON "content_rels" USING btree ("order");
  CREATE INDEX "content_rels_parent_idx" ON "content_rels" USING btree ("parent_id");
  CREATE INDEX "content_rels_path_idx" ON "content_rels" USING btree ("path");
  CREATE INDEX "content_rels_content_id_idx" ON "content_rels" USING btree ("content_id");
  CREATE INDEX "_content_v_blocks_hero_points_order_idx" ON "_content_v_blocks_hero_points" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_hero_points_parent_id_idx" ON "_content_v_blocks_hero_points" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_hero_points_locale_idx" ON "_content_v_blocks_hero_points" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_hero_order_idx" ON "_content_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_hero_parent_id_idx" ON "_content_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_hero_path_idx" ON "_content_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_hero_locale_idx" ON "_content_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_rich_text_order_idx" ON "_content_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_rich_text_parent_id_idx" ON "_content_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_rich_text_path_idx" ON "_content_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_rich_text_locale_idx" ON "_content_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_feature_grid_items_order_idx" ON "_content_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_feature_grid_items_parent_id_idx" ON "_content_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_feature_grid_items_locale_idx" ON "_content_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_feature_grid_order_idx" ON "_content_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_feature_grid_parent_id_idx" ON "_content_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_feature_grid_path_idx" ON "_content_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_feature_grid_locale_idx" ON "_content_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_faq_items_order_idx" ON "_content_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_faq_items_parent_id_idx" ON "_content_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_faq_items_locale_idx" ON "_content_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_faq_order_idx" ON "_content_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_faq_parent_id_idx" ON "_content_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_faq_path_idx" ON "_content_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_faq_locale_idx" ON "_content_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_testimonials_items_order_idx" ON "_content_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_testimonials_items_parent_id_idx" ON "_content_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_testimonials_items_locale_idx" ON "_content_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_testimonials_order_idx" ON "_content_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_testimonials_parent_id_idx" ON "_content_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_testimonials_path_idx" ON "_content_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_testimonials_locale_idx" ON "_content_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_cta_order_idx" ON "_content_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_cta_parent_id_idx" ON "_content_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_cta_path_idx" ON "_content_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_cta_locale_idx" ON "_content_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_form_order_idx" ON "_content_v_blocks_form" USING btree ("_order");
  CREATE INDEX "_content_v_blocks_form_parent_id_idx" ON "_content_v_blocks_form" USING btree ("_parent_id");
  CREATE INDEX "_content_v_blocks_form_path_idx" ON "_content_v_blocks_form" USING btree ("_path");
  CREATE INDEX "_content_v_blocks_form_locale_idx" ON "_content_v_blocks_form" USING btree ("_locale");
  CREATE INDEX "_content_v_blocks_form_form_idx" ON "_content_v_blocks_form" USING btree ("form_id");
  CREATE INDEX "_content_v_parent_idx" ON "_content_v" USING btree ("parent_id");
  CREATE INDEX "_content_v_version_version_key_idx" ON "_content_v" USING btree ("version_key");
  CREATE INDEX "_content_v_version_version_kind_idx" ON "_content_v" USING btree ("version_kind");
  CREATE INDEX "_content_v_version_version_is_active_idx" ON "_content_v" USING btree ("version_is_active");
  CREATE INDEX "_content_v_version_version_parent_idx" ON "_content_v" USING btree ("version_parent_id");
  CREATE INDEX "_content_v_version_seo_version_seo_og_image_idx" ON "_content_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_content_v_version_version_updated_at_idx" ON "_content_v" USING btree ("version_updated_at");
  CREATE INDEX "_content_v_version_version_created_at_idx" ON "_content_v" USING btree ("version_created_at");
  CREATE INDEX "_content_v_created_at_idx" ON "_content_v" USING btree ("created_at");
  CREATE INDEX "_content_v_updated_at_idx" ON "_content_v" USING btree ("updated_at");
  CREATE INDEX "_content_v_snapshot_idx" ON "_content_v" USING btree ("snapshot");
  CREATE INDEX "_content_v_published_locale_idx" ON "_content_v" USING btree ("published_locale");
  CREATE INDEX "_content_v_latest_idx" ON "_content_v" USING btree ("latest");
  CREATE INDEX "_content_v_autosave_idx" ON "_content_v" USING btree ("autosave");
  CREATE INDEX "version_kind_version_isActive_idx" ON "_content_v" USING btree ("version_kind","version_is_active");
  CREATE INDEX "_content_v_version_version_path_idx" ON "_content_v_locales" USING btree ("version_path","_locale");
  CREATE INDEX "_content_v_version_version_search_text_idx" ON "_content_v_locales" USING btree ("version_search_text","_locale");
  CREATE INDEX "_content_v_version_version__status_idx" ON "_content_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_content_v_locales_locale_parent_id_unique" ON "_content_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_content_v_rels_order_idx" ON "_content_v_rels" USING btree ("order");
  CREATE INDEX "_content_v_rels_parent_idx" ON "_content_v_rels" USING btree ("parent_id");
  CREATE INDEX "_content_v_rels_path_idx" ON "_content_v_rels" USING btree ("path");
  CREATE INDEX "_content_v_rels_content_id_idx" ON "_content_v_rels" USING btree ("content_id");
  CREATE INDEX "forms_fields_order_idx" ON "forms_fields" USING btree ("_order");
  CREATE INDEX "forms_fields_parent_id_idx" ON "forms_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "forms_fields_locales_locale_parent_id_unique" ON "forms_fields_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_key_idx" ON "forms" USING btree ("key");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "form_submissions_legacy_i_d_idx" ON "form_submissions" USING btree ("legacy_i_d");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_locale_idx" ON "form_submissions" USING btree ("locale");
  CREATE INDEX "form_submissions_contact_name_idx" ON "form_submissions" USING btree ("contact_name");
  CREATE INDEX "form_submissions_contact_phone_idx" ON "form_submissions" USING btree ("contact_phone");
  CREATE INDEX "form_submissions_contact_email_idx" ON "form_submissions" USING btree ("contact_email");
  CREATE INDEX "form_submissions_company_idx" ON "form_submissions" USING btree ("company");
  CREATE INDEX "form_submissions_status_idx" ON "form_submissions" USING btree ("status");
  CREATE INDEX "form_submissions_priority_idx" ON "form_submissions" USING btree ("priority");
  CREATE INDEX "form_submissions_assigned_to_idx" ON "form_submissions" USING btree ("assigned_to_id");
  CREATE INDEX "form_submissions_ip_hash_idx" ON "form_submissions" USING btree ("ip_hash");
  CREATE INDEX "form_submissions_expires_at_idx" ON "form_submissions" USING btree ("expires_at");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "submission_files_legacy_i_d_idx" ON "submission_files" USING btree ("legacy_i_d");
  CREATE INDEX "submission_files_submission_idx" ON "submission_files" USING btree ("submission_id");
  CREATE INDEX "submission_files_updated_at_idx" ON "submission_files" USING btree ("updated_at");
  CREATE INDEX "submission_files_created_at_idx" ON "submission_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "submission_files_filename_idx" ON "submission_files" USING btree ("filename");
  CREATE UNIQUE INDEX "audit_logs_legacy_i_d_idx" ON "audit_logs" USING btree ("legacy_i_d");
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
  CREATE INDEX "audit_logs_object_type_idx" ON "audit_logs" USING btree ("object_type");
  CREATE INDEX "audit_logs_object_i_d_idx" ON "audit_logs" USING btree ("object_i_d");
  CREATE INDEX "audit_logs_occurred_at_idx" ON "audit_logs" USING btree ("occurred_at");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_content_id_idx" ON "payload_locked_documents_rels" USING btree ("content_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_submission_files_id_idx" ON "payload_locked_documents_rels" USING btree ("submission_files_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_version_logo_idx" ON "_site_settings_v" USING btree ("version_logo_id");
  CREATE INDEX "_site_settings_v_version_version_favicon_idx" ON "_site_settings_v" USING btree ("version_favicon_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_design_settings_v_created_at_idx" ON "_design_settings_v" USING btree ("created_at");
  CREATE INDEX "_design_settings_v_updated_at_idx" ON "_design_settings_v" USING btree ("updated_at");
  CREATE INDEX "navigation_header_children_order_idx" ON "navigation_header_children" USING btree ("_order");
  CREATE INDEX "navigation_header_children_parent_id_idx" ON "navigation_header_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_children_locales_locale_parent_id_unique" ON "navigation_header_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_order_idx" ON "navigation_header" USING btree ("_order");
  CREATE INDEX "navigation_header_parent_id_idx" ON "navigation_header" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_locales_locale_parent_id_unique" ON "navigation_header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_children_order_idx" ON "navigation_footer_children" USING btree ("_order");
  CREATE INDEX "navigation_footer_children_parent_id_idx" ON "navigation_footer_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_children_locales_locale_parent_id_unique" ON "navigation_footer_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_order_idx" ON "navigation_footer" USING btree ("_order");
  CREATE INDEX "navigation_footer_parent_id_idx" ON "navigation_footer" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_locales_locale_parent_id_unique" ON "navigation_footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_mobile_children_order_idx" ON "navigation_mobile_children" USING btree ("_order");
  CREATE INDEX "navigation_mobile_children_parent_id_idx" ON "navigation_mobile_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_mobile_children_locales_locale_parent_id_unique" ON "navigation_mobile_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_mobile_order_idx" ON "navigation_mobile" USING btree ("_order");
  CREATE INDEX "navigation_mobile_parent_id_idx" ON "navigation_mobile" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_mobile_locales_locale_parent_id_unique" ON "navigation_mobile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_header_children_order_idx" ON "_navigation_v_version_header_children" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_children_parent_id_idx" ON "_navigation_v_version_header_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_header_children_locales_locale_parent_" ON "_navigation_v_version_header_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_header_order_idx" ON "_navigation_v_version_header" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_parent_id_idx" ON "_navigation_v_version_header" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_header_locales_locale_parent_id_unique" ON "_navigation_v_version_header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_footer_children_order_idx" ON "_navigation_v_version_footer_children" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_footer_children_parent_id_idx" ON "_navigation_v_version_footer_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_footer_children_locales_locale_parent_" ON "_navigation_v_version_footer_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_footer_order_idx" ON "_navigation_v_version_footer" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_footer_parent_id_idx" ON "_navigation_v_version_footer" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_footer_locales_locale_parent_id_unique" ON "_navigation_v_version_footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_mobile_children_order_idx" ON "_navigation_v_version_mobile_children" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_mobile_children_parent_id_idx" ON "_navigation_v_version_mobile_children" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_mobile_children_locales_locale_parent_" ON "_navigation_v_version_mobile_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_mobile_order_idx" ON "_navigation_v_version_mobile" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_mobile_parent_id_idx" ON "_navigation_v_version_mobile" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_mobile_locales_locale_parent_id_unique" ON "_navigation_v_version_mobile_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "content_blocks_hero_points" CASCADE;
  DROP TABLE "content_blocks_hero" CASCADE;
  DROP TABLE "content_blocks_rich_text" CASCADE;
  DROP TABLE "content_blocks_feature_grid_items" CASCADE;
  DROP TABLE "content_blocks_feature_grid" CASCADE;
  DROP TABLE "content_blocks_faq_items" CASCADE;
  DROP TABLE "content_blocks_faq" CASCADE;
  DROP TABLE "content_blocks_testimonials_items" CASCADE;
  DROP TABLE "content_blocks_testimonials" CASCADE;
  DROP TABLE "content_blocks_cta" CASCADE;
  DROP TABLE "content_blocks_form" CASCADE;
  DROP TABLE "content" CASCADE;
  DROP TABLE "content_locales" CASCADE;
  DROP TABLE "content_rels" CASCADE;
  DROP TABLE "_content_v_blocks_hero_points" CASCADE;
  DROP TABLE "_content_v_blocks_hero" CASCADE;
  DROP TABLE "_content_v_blocks_rich_text" CASCADE;
  DROP TABLE "_content_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_content_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_content_v_blocks_faq_items" CASCADE;
  DROP TABLE "_content_v_blocks_faq" CASCADE;
  DROP TABLE "_content_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_content_v_blocks_testimonials" CASCADE;
  DROP TABLE "_content_v_blocks_cta" CASCADE;
  DROP TABLE "_content_v_blocks_form" CASCADE;
  DROP TABLE "_content_v" CASCADE;
  DROP TABLE "_content_v_locales" CASCADE;
  DROP TABLE "_content_v_rels" CASCADE;
  DROP TABLE "forms_fields" CASCADE;
  DROP TABLE "forms_fields_locales" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "submission_files" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "design_settings" CASCADE;
  DROP TABLE "_design_settings_v" CASCADE;
  DROP TABLE "navigation_header_children" CASCADE;
  DROP TABLE "navigation_header_children_locales" CASCADE;
  DROP TABLE "navigation_header" CASCADE;
  DROP TABLE "navigation_header_locales" CASCADE;
  DROP TABLE "navigation_footer_children" CASCADE;
  DROP TABLE "navigation_footer_children_locales" CASCADE;
  DROP TABLE "navigation_footer" CASCADE;
  DROP TABLE "navigation_footer_locales" CASCADE;
  DROP TABLE "navigation_mobile_children" CASCADE;
  DROP TABLE "navigation_mobile_children_locales" CASCADE;
  DROP TABLE "navigation_mobile" CASCADE;
  DROP TABLE "navigation_mobile_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "_navigation_v_version_header_children" CASCADE;
  DROP TABLE "_navigation_v_version_header_children_locales" CASCADE;
  DROP TABLE "_navigation_v_version_header" CASCADE;
  DROP TABLE "_navigation_v_version_header_locales" CASCADE;
  DROP TABLE "_navigation_v_version_footer_children" CASCADE;
  DROP TABLE "_navigation_v_version_footer_children_locales" CASCADE;
  DROP TABLE "_navigation_v_version_footer" CASCADE;
  DROP TABLE "_navigation_v_version_footer_locales" CASCADE;
  DROP TABLE "_navigation_v_version_mobile_children" CASCADE;
  DROP TABLE "_navigation_v_version_mobile_children_locales" CASCADE;
  DROP TABLE "_navigation_v_version_mobile" CASCADE;
  DROP TABLE "_navigation_v_version_mobile_locales" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_content_blocks_hero_variant";
  DROP TYPE "public"."enum_content_blocks_rich_text_variant";
  DROP TYPE "public"."enum_content_blocks_feature_grid_variant";
  DROP TYPE "public"."enum_content_blocks_faq_variant";
  DROP TYPE "public"."enum_content_blocks_testimonials_variant";
  DROP TYPE "public"."enum_content_blocks_cta_variant";
  DROP TYPE "public"."enum_content_blocks_form_variant";
  DROP TYPE "public"."enum_content_kind";
  DROP TYPE "public"."enum_content_translation_status";
  DROP TYPE "public"."enum_content_workflow_status";
  DROP TYPE "public"."enum_content_status";
  DROP TYPE "public"."enum__content_v_blocks_hero_variant";
  DROP TYPE "public"."enum__content_v_blocks_rich_text_variant";
  DROP TYPE "public"."enum__content_v_blocks_feature_grid_variant";
  DROP TYPE "public"."enum__content_v_blocks_faq_variant";
  DROP TYPE "public"."enum__content_v_blocks_testimonials_variant";
  DROP TYPE "public"."enum__content_v_blocks_cta_variant";
  DROP TYPE "public"."enum__content_v_blocks_form_variant";
  DROP TYPE "public"."enum__content_v_version_kind";
  DROP TYPE "public"."enum__content_v_published_locale";
  DROP TYPE "public"."enum__content_v_version_translation_status";
  DROP TYPE "public"."enum__content_v_version_workflow_status";
  DROP TYPE "public"."enum__content_v_version_status";
  DROP TYPE "public"."enum_forms_fields_field_type";
  DROP TYPE "public"."enum_form_submissions_locale";
  DROP TYPE "public"."enum_form_submissions_status";
  DROP TYPE "public"."enum_form_submissions_priority";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
