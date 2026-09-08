import type { Content } from "@/payload-types";
import { isLocale } from "@/lib/locales";
import { normalizePath, validatePath, validateSlug } from "@/lib/public-url";
import { redirectKey, validateRedirectRule, type RedirectRule } from "@/lib/redirect-policy";
import type { CollectionAfterChangeHook, CollectionBeforeValidateHook, CollectionSlug, PayloadRequest } from "payload";
import { ValidationError } from "payload";

type RedirectData = {
  id?: number | string;
  sourceLocale?: string;
  sourcePath?: string;
  sourceKey?: string;
  to?: { type?: "content" | "url"; content?: number | Content | null; locale?: string; url?: string };
  status?: "307" | "308";
  enabled?: boolean;
};

function validationError(path: string, message: string, req: PayloadRequest) {
  throw new ValidationError({ collection: "content", errors: [{ path, message }], req });
}

async function resolvedRule(data: RedirectData, req: PayloadRequest): Promise<RedirectRule> {
  if (!isLocale(data.sourceLocale ?? "")) validationError("sourceLocale", "A supported source locale is required.", req);
  const sourceLocale = data.sourceLocale as RedirectRule["sourceLocale"];
  const sourcePath = normalizePath(data.sourcePath ?? "");
  if (data.to?.type === "url") {
    return {
      id: data.id,
      sourceLocale,
      sourcePath,
      destination: { type: "url", url: data.to.url ?? "" },
      status: data.status === "307" ? "307" : "308",
      enabled: data.enabled !== false,
    };
  }

  if (!isLocale(data.to?.locale ?? "")) validationError("to.locale", "A supported destination locale is required.", req);
  const contentID = typeof data.to?.content === "object" && data.to.content ? data.to.content.id : data.to?.content;
  if (contentID === null || contentID === undefined) validationError("to.content", "A destination content document is required.", req);
  const destination = await req.payload.findByID({
    collection: "content",
    id: contentID as number,
    locale: data.to?.locale as RedirectRule["sourceLocale"],
    fallbackLocale: false,
    depth: 0,
    draft: false,
    overrideAccess: true,
    req,
  });
  if (destination._status !== "published" || destination.isActive === false || typeof destination.path !== "string") {
    validationError("to.content", "The destination must be a published, active localized public document.", req);
  }
  return {
    id: data.id,
    sourceLocale,
    sourcePath,
    destination: { type: "content", locale: data.to?.locale as RedirectRule["sourceLocale"], path: destination.path as string },
    status: data.status === "307" ? "307" : "308",
    enabled: data.enabled !== false,
  };
}

async function existingRedirectRules(req: PayloadRequest): Promise<RedirectRule[]> {
  const result = await req.payload.find({
    collection: "seo-redirects" as CollectionSlug,
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    req,
  });
  const rules: RedirectRule[] = [];
  for (const value of result.docs as unknown as RedirectData[]) {
    if (value.enabled === false) continue;
    rules.push(await resolvedRule(value, req));
  }
  return rules;
}

export const validateContentRoute: CollectionBeforeValidateHook<Content> = async ({ data, originalDoc, req }) => {
  const path = data?.path ?? originalDoc?.path;
  const slug = data?.slug ?? originalDoc?.slug;
  if (typeof path === "string") {
    const result = validatePath(path);
    if (!result.valid || result.normalizedPath !== path) validationError("path", "Path must satisfy the normalized public path contract.", req);
  }
  if (typeof slug === "string") {
    const result = validateSlug(slug);
    if (!result.valid || result.normalizedPath !== slug) validationError("slug", "Slug must be one normalized public path segment.", req);
  }
  if (typeof path !== "string" || !isLocale(String(req.locale))) return data;

  const duplicate = await req.payload.find({
    collection: "content",
    locale: req.locale as RedirectRule["sourceLocale"],
    fallbackLocale: false,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { path: { equals: path } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  });
  if (duplicate.totalDocs > 0) validationError("path", "This localized public path is already in use.", req);

  const redirect = await req.payload.find({
    collection: "seo-redirects" as CollectionSlug,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { and: [{ sourceKey: { equals: redirectKey(req.locale as RedirectRule["sourceLocale"], path) } }, { enabled: { equals: true } }] },
  });
  if (redirect.totalDocs > 0) validationError("path", "This path is reserved by an active redirect source.", req);
  return data;
};

export const validateSeoRedirect: CollectionBeforeValidateHook<RedirectData & { id: number | string }> = async ({ data, originalDoc, req }) => {
  const merged: RedirectData = { ...originalDoc, ...data, to: { ...originalDoc?.to, ...data?.to } };
  if (typeof merged.sourcePath === "string") {
    const normalized = normalizePath(merged.sourcePath);
    merged.sourcePath = normalized;
    const sourceLocale = merged.sourceLocale ?? "";
    merged.sourceKey = isLocale(sourceLocale) ? redirectKey(sourceLocale, normalized) : undefined;
    if (data) {
      data.sourcePath = merged.sourcePath;
      data.sourceKey = merged.sourceKey;
    }
  }
  const candidate = await resolvedRule(merged, req);
  const errors = validateRedirectRule(candidate, await existingRedirectRules(req));
  if (errors.length) validationError("sourcePath", `Invalid redirect: ${errors.join(", ")}.`, req);
  return data;
};

const SKIP_REDIRECT_LIFECYCLE = "skipSeoRedirectLifecycle";

export const createPathChangeRedirect: CollectionAfterChangeHook<Content> = async ({ doc, previousDoc, req }) => {
  const locale = String(req.locale);
  if (req.context[SKIP_REDIRECT_LIFECYCLE] || !previousDoc || !isLocale(locale)) return;
  if (previousDoc._status !== "published" || doc._status !== "published") return;
  if (typeof previousDoc.path !== "string" || typeof doc.path !== "string" || previousDoc.path === doc.path) return;

  await req.payload.create({
    collection: "seo-redirects" as CollectionSlug,
    overrideAccess: true,
    req,
    context: { ...req.context, [SKIP_REDIRECT_LIFECYCLE]: true },
    data: {
      sourceLocale: locale,
      sourcePath: previousDoc.path,
      sourceKey: redirectKey(locale, previousDoc.path),
      to: { type: "content", content: doc.id, locale },
      status: "308",
      enabled: true,
      reason: "published-path-change",
    },
  });
};
