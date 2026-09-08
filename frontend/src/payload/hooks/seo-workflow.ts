import type { Content, SeoRedirect } from "@/payload-types";
import { hasRole } from "../access";
import type { CollectionBeforeChangeHook, PayloadRequest } from "payload";
import { ValidationError } from "payload";

function reject(path: string, message: string, req: PayloadRequest, collection: string) {
  throw new ValidationError({ collection, errors: [{ path, message }], req });
}

export const enforceSeoContentUpdate: CollectionBeforeChangeHook<Content> = ({ data, originalDoc, operation, req }) => {
  if (!hasRole(req.user, ["seo"])) return data;
  if (operation !== "update" || !originalDoc) reject("seo", "SEO users may only update SEO fields on existing content.", req, "content");

  for (const [key, value] of Object.entries(data)) {
    if (["seo", "updatedAt"].includes(key)) continue;
    if (JSON.stringify(value) !== JSON.stringify(originalDoc?.[key as keyof Content])) {
      reject(key, "SEO users cannot modify content, routing, workflow, or publication fields.", req, "content");
    }
  }
  return data;
};

export const enforceSeoRedirectDraft: CollectionBeforeChangeHook<SeoRedirect> = ({ data, req }) => {
  if (!hasRole(req.user, ["seo"])) return data;
  if (data.enabled !== false) reject("enabled", "SEO users may save redirect drafts but cannot activate redirects.", req, "seo-redirects");
  return data;
};
