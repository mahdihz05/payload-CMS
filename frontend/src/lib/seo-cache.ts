import type { Locale } from "./types";
import { normalizePath } from "./public-url";

export const SEO_SITEMAP_TAG = "seo:sitemap";
export const SEO_REDIRECTS_TAG = "seo:redirects";
export const SEO_SITE_TAG = "seo:site";
export const SEO_CACHE_VERSION = "v1";

export function seoPageTag(locale: Locale, path: string): string {
  return `seo:page:${locale}:${normalizePath(path)}`;
}

export function seoLocaleTag(locale: Locale): string {
  return `seo:locale:${locale}`;
}
