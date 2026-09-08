import type { CollectionConfig } from "payload";
import { adminOnly, contentReader, seoManager } from "../access";
import { auditCollectionChange, auditCollectionDelete } from "../hooks/audit";
import { validateSeoRedirect } from "../hooks/seo-routing";
import { revalidateDeletedRedirect, revalidateRedirect } from "../hooks/revalidate";
import { enforceSeoRedirectDraft } from "../hooks/seo-workflow";
import { localeConfig } from "@/lib/site-config";

const localeOptions = localeConfig.map(({ code, label }) => ({ value: code, label }));

export const SeoRedirects: CollectionConfig = {
  slug: "seo-redirects",
  admin: { group: "SEO", useAsTitle: "sourceKey", defaultColumns: ["sourceKey", "status", "enabled", "updatedAt"] },
  access: { create: seoManager, delete: adminOnly, read: contentReader, update: seoManager },
  hooks: { beforeValidate: [validateSeoRedirect], beforeChange: [enforceSeoRedirectDraft], afterChange: [revalidateRedirect, auditCollectionChange], afterDelete: [revalidateDeletedRedirect, auditCollectionDelete] },
  fields: [
    { name: "sourceLocale", type: "select", required: true, options: localeOptions, index: true },
    { name: "sourcePath", type: "text", index: true, admin: { description: "Normalized locale-relative source path." } },
    { name: "sourceKey", type: "text", required: true, unique: true, index: true, admin: { hidden: true } },
    {
      name: "to",
      type: "group",
      fields: [
        { name: "type", type: "radio", required: true, defaultValue: "content", options: ["content", "url"] },
        { name: "content", type: "relationship", relationTo: "content", admin: { condition: (_, siblingData) => siblingData?.type === "content" } },
        { name: "locale", type: "select", options: localeOptions, admin: { condition: (_, siblingData) => siblingData?.type === "content" } },
        { name: "url", type: "text", admin: { condition: (_, siblingData) => siblingData?.type === "url" } },
      ],
    },
    { name: "status", type: "select", required: true, defaultValue: "308", options: ["308", "307"] },
    { name: "enabled", type: "checkbox", required: true, defaultValue: true, index: true },
    { name: "reason", type: "text" },
  ],
};
