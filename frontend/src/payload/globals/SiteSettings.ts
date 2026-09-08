import type { GlobalConfig } from "payload";
import { adminOnly } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";
import { auditGlobalChange } from "../hooks/audit";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Configuration" },
  access: { read: () => true, update: adminOnly },
  hooks: { afterChange: [revalidateGlobal, auditGlobalChange] },
  versions: { max: 25 },
  fields: [
    { name: "brandName", type: "text", defaultValue: "Payload CMS Starter", required: true },
    { name: "logo", type: "relationship", relationTo: "media" },
    { name: "favicon", type: "relationship", relationTo: "media" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    { name: "customerPortalURL", type: "text" },
    { name: "externalCheckoutURL", type: "text" },
    { name: "socialLinks", type: "json" },
    { name: "address", type: "text", localized: true },
    { name: "locationLabel", type: "text", localized: true },
    { name: "defaultSEOTitle", type: "text", localized: true, maxLength: 70 },
    { name: "defaultSEODescription", type: "textarea", localized: true, maxLength: 170 },
  ],
};
