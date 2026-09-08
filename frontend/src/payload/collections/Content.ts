import type { CollectionConfig, Field } from "payload";
import { validateCanonicalOverride } from "@/lib/public-url";
import { defaultLocale } from "@/lib/site-config";
import { contentFieldManager, contentManager, contentReader, publishedOrAuthenticated, seoFieldManager, seoManager } from "../access";
import { contentBlocks } from "../blocks";
import { auditCollectionChange, auditCollectionDelete } from "../hooks/audit";
import { revalidateContent, revalidateDeletedContent } from "../hooks/revalidate";
import { populateSearchText } from "../hooks/search-text";
import { createPathChangeRedirect, validateContentRoute } from "../hooks/seo-routing";
import { enforceSeoContentUpdate } from "../hooks/seo-workflow";

function restrictSeoEditing(field: Field, insideSeo = false): Field {
  if (field.type === "tabs") return { ...field, tabs: field.tabs.map((tab) => ({ ...tab, fields: tab.fields.map((child) => restrictSeoEditing(child, insideSeo)) })) };
  if (field.type === "ui" || !("name" in field)) return field;
  const seoField = insideSeo || field.name === "seo";
  const access = { ...field.access, update: seoField ? seoFieldManager : contentFieldManager };
  if (field.type === "group") return { ...field, access, fields: field.fields.map((child) => restrictSeoEditing(child, seoField)) } as Field;
  return { ...field, access } as Field;
}

export const Content: CollectionConfig = {
  slug: "content",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "path", "translationStatus", "_status", "updatedAt"],
    listSearchableFields: ["title", "key", "path", "excerpt"],
    enableListViewSelectAPI: true,
    description: "Localized pages and editorial content rendered from reusable blocks.",
    preview: (document, { locale }) => {
      const localeCode = locale || defaultLocale;
      const path = typeof document.path === "string" ? document.path.replace(/^\/+|\/+$/g, "") : "";
      return `/${localeCode}${path ? `/${path}` : ""}?draft=1`;
    },
  },
  access: { create: contentManager, delete: contentManager, read: publishedOrAuthenticated, update: seoManager, readVersions: contentReader },
  versions: { drafts: { autosave: { interval: 1500, showSaveDraftButton: true }, localizeStatus: true, schedulePublish: true }, maxPerDoc: 50 },
  hooks: { beforeValidate: [validateContentRoute], beforeChange: [enforceSeoContentUpdate, populateSearchText], afterChange: [createPathChangeRedirect, revalidateContent, auditCollectionChange], afterDelete: [revalidateDeletedContent, auditCollectionDelete] },
  fields: ([
    { name: "key", type: "text", required: true, unique: true, index: true, admin: { position: "sidebar", description: "Stable technical identifier. Avoid changing it after publication." } },
    { name: "kind", type: "select", required: true, index: true, defaultValue: "page", options: ["page", "service", "solution", "knowledge", "news"], admin: { position: "sidebar" } },
    { name: "templateKey", type: "text", defaultValue: "default", required: true, admin: { position: "sidebar", description: "Optional presentation key for site-specific renderers. Generic pages use default." } },
    { name: "isActive", type: "checkbox", defaultValue: true, index: true, admin: { position: "sidebar" } },
    { type: "tabs", tabs: [
      { label: "Content", description: "Visible page content.", fields: [
        { name: "title", type: "text", localized: true, required: true, maxLength: 180 },
        { name: "excerpt", type: "textarea", localized: true, maxLength: 500 },
        { name: "layout", type: "blocks", localized: true, blocks: contentBlocks, admin: { initCollapsed: true } },
      ] },
      { label: "Routing", description: "Public URL and content relationships.", fields: [
        { name: "slug", type: "text", localized: true, required: true, maxLength: 180 },
        { name: "path", type: "text", localized: true, index: true, maxLength: 500, validate: (value: unknown, { data }: { data?: { key?: unknown } }) => data?.key === "home" || (typeof value === "string" && value.trim().length > 0) || "A localized path is required for every non-home page.", admin: { description: "Locale-relative path without a leading slash. Leave empty only for Home." } },
        { name: "parent", type: "relationship", relationTo: "content", filterOptions: ({ id }) => ({ id: { not_equals: id } }) },
        { name: "relatedContent", type: "relationship", relationTo: "content", hasMany: true },
      ] },
      { label: "SEO", description: "Defaults to the page title, excerpt, and public URL when fields are empty.", fields: [{
        name: "seo", type: "group", fields: [
          { name: "title", type: "text", localized: true, maxLength: 70, admin: { description: "Optional search and social title. Keep it descriptive and concise." } },
          { name: "description", type: "textarea", localized: true, maxLength: 170, admin: { description: "Optional search description. Uses the page excerpt when empty." } },
          { name: "canonicalURL", type: "text", localized: true, validate: (value: unknown) => !value || (typeof value === "string" && validateCanonicalOverride(value).valid) || "Canonical override must be an absolute HTTP(S) URL without credentials or a fragment.", admin: { description: "Advanced: point search engines at another authoritative URL. The page is omitted from the sitemap while an override is enabled." } },
          { name: "canonicalOverrideEnabled", type: "checkbox", localized: true, defaultValue: false, validate: (value: unknown, { siblingData }: { siblingData: { canonicalURL?: unknown } }) => value !== true || (typeof siblingData.canonicalURL === "string" && validateCanonicalOverride(siblingData.canonicalURL).valid) || "Enter a valid canonical override before enabling it.", admin: { description: "Enable only after reviewing duplicate-content and sitemap consequences." } },
          { name: "robotsIndex", type: "checkbox", defaultValue: true, admin: { description: "Disable to request noindex and remove this page from the sitemap." } },
          { name: "robotsFollow", type: "checkbox", defaultValue: true, admin: { description: "Disable to request that crawlers do not follow links on this page." } },
          { name: "ogTitle", type: "text", localized: true, maxLength: 100 },
          { name: "ogDescription", type: "textarea", localized: true, maxLength: 220 },
          { name: "ogImage", type: "relationship", relationTo: "media" },
        ],
      }] },
    ] },
    { name: "searchText", type: "text", localized: true, index: true, admin: { hidden: true } },
    { name: "translationStatus", type: "select", localized: true, defaultValue: "draft", options: ["missing", "draft", "translated", "reviewed", "outdated"], admin: { position: "sidebar" } },
    { name: "workflowStatus", type: "select", localized: true, defaultValue: "draft", options: ["draft", "review", "scheduled", "published", "archived"], admin: { position: "sidebar" } },
    { name: "legacyPublishedAt", type: "date", localized: true, admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" }, description: "Optional source publication date for imported editorial content." } },
  ] as Field[]).map((field) => restrictSeoEditing(field)),
  indexes: [{ fields: ["kind", "isActive"] }],
};
