import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { fa } from "@payloadcms/translations/languages/fa";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Content } from "./payload/collections/Content";
import { AuditLogs } from "./payload/collections/AuditLogs";
import { Forms, FormSubmissions } from "./payload/collections/Forms";
import { Media } from "./payload/collections/Media";
import { SubmissionFiles } from "./payload/collections/SubmissionFiles";
import { SeoRedirects } from "./payload/collections/SeoRedirects";
import { Users } from "./payload/collections/Users";
import { DesignSettings } from "./payload/globals/DesignSettings";
import { Navigation } from "./payload/globals/Navigation";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { databaseURI, defaultLocale, localeConfig, payloadSecret } from "./lib/site-config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  i18n: {
    fallbackLanguage: "en",
    supportedLanguages: { fa, en },
  },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " - Payload CMS" },
    dateFormat: "yyyy/MM/dd HH:mm",
  },
  collections: [Users, Media, Content, SeoRedirects, Forms, FormSubmissions, SubmissionFiles, AuditLogs],
  globals: [SiteSettings, DesignSettings, Navigation],
  db: postgresAdapter({ migrationDir: path.resolve(dirname, "migrations"), pool: { connectionString: databaseURI() } }),
  editor: lexicalEditor(),
  localization: {
    locales: localeConfig.map((locale) => ({ code: locale.code, label: locale.label, rtl: locale.direction === "rtl" })),
    defaultLocale,
    fallback: false,
  },
  experimental: { localizeStatus: true },
  secret: payloadSecret(),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
