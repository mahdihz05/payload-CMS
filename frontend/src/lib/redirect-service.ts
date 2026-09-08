import { getPayload } from "payload";
import { unstable_cache } from "next/cache";
import { buildLocalizedUrl, validateCanonicalOverride } from "./public-url";
import { redirectKey, type RedirectStatus } from "./redirect-policy";
import type { Locale } from "./types";
import { seoPageTag, SEO_CACHE_VERSION, SEO_REDIRECTS_TAG } from "./seo-cache";

export type ResolvedRedirect = { destination: string; status: 307 | 308 };

export async function loadPublicRedirect(locale: Locale, path: string): Promise<ResolvedRedirect | null> {
  const { default: config } = await import("@/payload.config");
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "seo-redirects",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { and: [{ sourceKey: { equals: redirectKey(locale, path) } }, { enabled: { equals: true } }] },
  });
  const redirect = result.docs[0];
  if (!redirect) return null;

  const status = Number(redirect.status as RedirectStatus) as 307 | 308;
  if (redirect.to.type === "url") {
    const validation = validateCanonicalOverride(redirect.to.url ?? "");
    return validation.valid ? { destination: validation.url, status } : null;
  }

  const destinationLocale = redirect.to.locale;
  const contentID = typeof redirect.to.content === "object" && redirect.to.content ? redirect.to.content.id : redirect.to.content;
  if (!destinationLocale || contentID === null || contentID === undefined) return null;
  const destination = await payload.findByID({
    collection: "content",
    id: contentID,
    locale: destinationLocale,
    fallbackLocale: false,
    depth: 0,
    draft: false,
    overrideAccess: true,
  });
  if (destination._status !== "published" || destination.isActive === false || typeof destination.path !== "string") return null;
  return { destination: buildLocalizedUrl(destinationLocale, destination.path), status };
}

export async function findPublicRedirect(locale: Locale, path: string): Promise<ResolvedRedirect | null> {
  return unstable_cache(
    () => loadPublicRedirect(locale, path),
    ["public-redirect", SEO_CACHE_VERSION, locale, path],
    { tags: [SEO_REDIRECTS_TAG, seoPageTag(locale, path)] },
  )();
}
