import type { Metadata } from "next";
import { cache } from "react";
import { getPayload } from "payload";
import { unstable_cache } from "next/cache";
import { locales } from "./locales";
import type { Locale } from "./types";
import { loadSeoDocument, loadSiteSeo } from "./seo-loader";
import { resolveSeo, type ResolvedSeo, type SeoSurface } from "./seo-resolver";
import type { SeoDocumentInput } from "./seo-contract";
import { seoLocaleTag, seoPageTag, SEO_CACHE_VERSION, SEO_REDIRECTS_TAG, SEO_SITE_TAG, SEO_SITEMAP_TAG } from "./seo-cache";
import { siteURL } from "./site-config";

const SITE_URL = siteURL();

export function metadataFromResolvedSeo(seo: ResolvedSeo): Metadata {
  const languages = { ...seo.alternates.languages, ...(seo.alternates.xDefault ? { "x-default": seo.alternates.xDefault } : {}) };
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: seo.canonical, languages },
    robots: { index: seo.robots.index, follow: seo.robots.follow, googleBot: { index: seo.robots.index, follow: seo.robots.follow } },
    openGraph: {
      type: "website",
      url: seo.canonical,
      title: seo.social.title,
      description: seo.social.description,
      locale: seo.social.locale.replace("-", "_"),
      alternateLocale: Object.keys(seo.alternates.languages).filter((language) => language !== seo.social.locale).map((language) => language.replace("-", "_")),
      ...(seo.social.image ? { images: [{ url: seo.social.image.url, alt: seo.social.image.alt }] } : {}),
    },
    twitter: {
      card: seo.social.image ? "summary_large_image" : "summary",
      title: seo.social.title,
      description: seo.social.description,
      ...(seo.social.image ? { images: [seo.social.image.url] } : {}),
    },
  };
}

async function resolveContentSeo(locale: Locale, path: string, preview: boolean, authorized: boolean) {
  const { default: config } = await import("@/payload.config");
  const payload = await getPayload({ config });
  const loaded = await loadSeoDocument(payload, locale, path, { preview, authorized });
  return loaded ? resolveSeo(loaded.document, loaded.site) : null;
}

const resolvedContentSeo = cache(async (locale: Locale, path: string, preview: boolean, authorized: boolean) => {
  if (preview) return resolveContentSeo(locale, path, true, authorized);
  return unstable_cache(
    () => resolveContentSeo(locale, path, false, false),
    ["resolved-seo", SEO_CACHE_VERSION, locale, path],
    { tags: [seoPageTag(locale, path), seoLocaleTag(locale), SEO_SITE_TAG, SEO_REDIRECTS_TAG, SEO_SITEMAP_TAG] },
  )();
});

export function resolvedSeoForPath(locale: Locale, path: string, preview = false, authorized = false) {
  return resolvedContentSeo(locale, path, preview, authorized);
}

export async function contentSeoMetadata(locale: Locale, path: string, preview = false, authorized = false): Promise<Metadata> {
  const resolved = await resolvedSeoForPath(locale, path, preview, authorized);
  return resolved ? metadataFromResolvedSeo(resolved) : {};
}

export async function systemRouteMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  surface: SeoSurface,
): Promise<Metadata> {
  const { default: config } = await import("@/payload.config");
  const payload = await getPayload({ config });
  const site = await loadSiteSeo(payload, locale);
  const translations = locales.map((candidate) => ({
    locale: candidate,
    path,
    isPublished: true,
    isActive: true,
    isRouteValid: true,
    hasUniquePath: true,
  }));
  const document: SeoDocumentInput = {
    identity: { id: 0, key: `system:${path}`, contentType: "page", templateKey: "system", locale, slug: path, path },
    content: { title, excerpt: description, blocks: [], h1: title },
    seo: {
      title: null, description: null, canonicalOverride: null, canonicalOverrideEnabled: false,
      robotsIndex: true, robotsFollow: true, socialTitle: null, socialDescription: null, socialImage: null,
    },
    workflow: { status: "published", workflowStatus: "published", isActive: true, isDeleted: false, isRedirectSource: false },
    translations,
    preview: { enabled: false, authorized: false },
    schema: { type: "page", breadcrumbs: [] },
  };
  return metadataFromResolvedSeo(resolveSeo(document, site, { surface }));
}

export { SITE_URL };
