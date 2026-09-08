import type { Content } from "@/payload-types";
import type { MetadataRoute } from "next";
import type { Payload } from "payload";
import { locales } from "./locales";
import { redirectKey } from "./redirect-policy";
import { loadSiteSeo, seoDocumentInputFromContent } from "./seo-loader";
import { resolveSeo } from "./seo-resolver";
import type { Locale } from "./types";
import { validatePath } from "./public-url";

export async function buildSeoSitemap(payload: Payload): Promise<MetadataRoute.Sitemap> {
  const [localizedResults, sites, redirects] = await Promise.all([
    Promise.all(locales.map((locale) => payload.find({
      collection: "content", locale, fallbackLocale: false, depth: 1, limit: 1000, draft: false, overrideAccess: true,
      where: { and: [{ _status: { equals: "published" } }, { isActive: { equals: true } }] },
    }))),
    Promise.all(locales.map((locale) => loadSiteSeo(payload, locale))),
    payload.find({ collection: "seo-redirects", depth: 0, limit: 1000, overrideAccess: true, where: { enabled: { equals: true } } }),
  ]);
  const redirectSources = new Set(redirects.docs.map((redirect) => redirect.sourceKey));
  const documentsByLocale = new Map<Locale, Map<number, Content>>();
  locales.forEach((locale, index) => documentsByLocale.set(locale, new Map(localizedResults[index].docs.map((document) => [document.id, document]))));

  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  locales.forEach((locale, localeIndex) => {
    for (const content of localizedResults[localeIndex].docs) {
      if (typeof content.path !== "string") continue;
      const translations = locales.map((candidate) => {
        const translated = documentsByLocale.get(candidate)?.get(content.id);
        const path = typeof translated?.path === "string" ? translated.path : null;
        const validation = path === null ? null : validatePath(path);
        return {
          locale: candidate,
          path,
          isPublished: translated?._status === "published",
          isActive: translated?.isActive !== false,
          isRouteValid: Boolean(validation?.valid && validation.normalizedPath === path),
          hasUniquePath: true,
        };
      });
      const document = seoDocumentInputFromContent({ content, locale, translations, isRedirectSource: redirectSources.has(redirectKey(locale, content.path)) });
      const resolved = resolveSeo(document, sites[localeIndex]);
      if (!resolved.sitemapEligible || seen.has(resolved.canonical)) continue;
      seen.add(resolved.canonical);
      entries.push({
        url: resolved.canonical,
        lastModified: content.updatedAt,
        changeFrequency: "monthly",
        priority: content.path === "" ? 1 : content.path.startsWith("services/") ? 0.8 : 0.7,
      });
    }
  });
  return entries;
}
