import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";
import type { Content, SeoRedirect } from "@/payload-types";
import { isLocale, locales } from "@/lib/locales";
import { seoLocaleTag, seoPageTag, SEO_REDIRECTS_TAG, SEO_SITE_TAG, SEO_SITEMAP_TAG } from "@/lib/seo-cache";

function invalidateTags(tags: string[], paths: string[] = []) {
  // Payload hooks also run from CLI seed/migration scripts, where Next's
  // request cache context does not exist. Database writes must still succeed.
  try {
    for (const tag of tags) revalidateTag(tag, "max");
    for (const path of paths) revalidatePath(path);
  } catch {
    // The next web request will populate the cache from the migrated records.
  }
}

export const revalidateContent: CollectionAfterChangeHook<Content> = ({ doc, previousDoc, req }) => {
  const locale = String(req.locale);
  if (!isLocale(locale)) return;
  const paths = [doc.path, previousDoc?.path].filter((path): path is string => typeof path === "string");
  invalidateTags(
    [SEO_SITEMAP_TAG, seoLocaleTag(locale), ...paths.map((path) => seoPageTag(locale, path))],
    paths.map((path) => `/${locale}${path ? `/${path}` : ""}`).concat("/sitemap.xml"),
  );
};

export const revalidateDeletedContent: CollectionAfterDeleteHook<Content> = ({ doc, req }) => {
  const locale = String(req.locale);
  if (!isLocale(locale) || typeof doc.path !== "string") return;
  invalidateTags([SEO_SITEMAP_TAG, seoLocaleTag(locale), seoPageTag(locale, doc.path)], [`/${locale}${doc.path ? `/${doc.path}` : ""}`, "/sitemap.xml"]);
};

export const revalidateGlobal: GlobalAfterChangeHook = () => {
  invalidateTags([SEO_SITE_TAG, SEO_SITEMAP_TAG, ...locales.map(seoLocaleTag)], ["/", "/sitemap.xml"]);
};

export const revalidateRedirect: CollectionAfterChangeHook<SeoRedirect> = ({ doc, previousDoc }) => {
  const paths = [doc, previousDoc].filter(Boolean).map((redirect) => `/${redirect.sourceLocale}${redirect.sourcePath ? `/${redirect.sourcePath}` : ""}`);
  invalidateTags([SEO_REDIRECTS_TAG, SEO_SITEMAP_TAG, seoPageTag(doc.sourceLocale, doc.sourcePath ?? "")], [...paths, "/sitemap.xml"]);
};

export const revalidateDeletedRedirect: CollectionAfterDeleteHook<SeoRedirect> = ({ doc }) => {
  const path = `/${doc.sourceLocale}${doc.sourcePath ? `/${doc.sourcePath}` : ""}`;
  invalidateTags([SEO_REDIRECTS_TAG, SEO_SITEMAP_TAG, seoPageTag(doc.sourceLocale, doc.sourcePath ?? "")], [path, "/sitemap.xml"]);
};
