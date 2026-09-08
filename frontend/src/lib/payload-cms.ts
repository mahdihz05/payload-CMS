import { cache } from "react";
import config from "@payload-config";
import { getPayload, type Where } from "payload";
import type { Content, DesignSetting, Media, Navigation, SiteSetting } from "@/payload-types";
import type { ContentDetail, ContentSummary, Locale, NavigationItem, SearchResult, SiteSettings } from "./types";
import { defaultLocale, locales } from "./site-config";
import { normalizeSearchText } from "./search-normalization";

const payloadClient = cache(() => getPayload({ config }));

function mediaURL(value: number | Media | null | undefined) {
  return value && typeof value === "object" ? value.url ?? null : null;
}

function summary(document: Content, locale: Locale): ContentSummary {
  return {
    id: String(document.id), key: document.key, kind: document.kind, locale,
    title: document.title, slug: document.slug,
    url: `/${locale}${document.path ? `/${document.path}` : ""}`,
    excerpt: document.excerpt ?? "", published_at: document.updatedAt,
  };
}

async function detail(document: Content, locale: Locale): Promise<ContentDetail> {
  const payload = await payloadClient();
  const alternateResults = await Promise.all(locales.map(async (alternateLocale) => {
    const translated = await payload.findByID({ collection: "content", id: document.id, locale: alternateLocale, fallbackLocale: false, depth: 0, overrideAccess: true });
    return translated?._status === "published" && translated.path !== undefined
      ? { locale: alternateLocale, url: `/${alternateLocale}${translated.path ? `/${translated.path}` : ""}` }
      : null;
  }));

  return {
    ...summary(document, locale),
    templateKey: document.templateKey,
    blocks: (document.layout ?? []).filter((block) => block.enabled !== false).map((block, order) => {
      const value = block as unknown as Record<string, unknown>;
      const blockType = typeof value.blockType === "string" ? value.blockType : "richText";
      const props: Record<string, unknown> = { ...value };
      for (const key of ["id", "blockName", "blockType", "enabled", "variant"]) delete props[key];
      return {
        id: typeof value.id === "string" ? value.id : `${document.id}-${order}`,
        type: blockType,
        variant: typeof value.variant === "string" ? value.variant : "default",
        order,
        props,
      };
    }),
    seo: {
      title: document.seo?.title ?? document.title,
      description: document.seo?.description ?? document.excerpt ?? "",
      canonical_url: document.seo?.canonicalURL ?? "",
      robots: { index: document.seo?.robotsIndex !== false, follow: document.seo?.robotsFollow !== false },
      open_graph: {
        title: document.seo?.ogTitle ?? document.seo?.title ?? document.title,
        description: document.seo?.ogDescription ?? document.seo?.description ?? document.excerpt ?? "",
        image: mediaURL(document.seo?.ogImage),
      },
    },
    alternates: alternateResults.filter((item): item is { locale: Locale; url: string } => item !== null),
  };
}

function publishedWhere(extra: Where): Where {
  return { and: [{ _status: { equals: "published" } }, { isActive: { equals: true } }, extra] };
}

async function collection(kind: Content["kind"], locale: Locale) {
  const payload = await payloadClient();
  const result = await payload.find({ collection: "content", locale, fallbackLocale: false, depth: 1, limit: 100, sort: "key", overrideAccess: true, where: publishedWhere({ kind: { equals: kind } }) });
  return result.docs.map((document) => summary(document, locale));
}

async function contentByPath(locale: Locale, path: string, draft = false) {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  const payload = await payloadClient();
  const result = await payload.find({
    collection: "content", locale, fallbackLocale: false, depth: 1, limit: 1, overrideAccess: true, draft,
    where: draft ? { and: [{ isActive: { equals: true } }, { path: { equals: normalizedPath } }] } : publishedWhere({ path: { equals: normalizedPath } }),
  });
  return result.docs[0] ? detail(result.docs[0], locale) : null;
}

function mapNavigation(items: NonNullable<Navigation["header"]>, locale: Locale): NavigationItem[] {
  return items.filter((item) => item.enabled !== false).map((item) => {
    const itemPath = item.path ?? "";
    return {
      id: item.id ?? `${locale}-${itemPath}`, title: item.title, description: item.description ?? "",
      url: itemPath.startsWith("http") ? itemPath : `/${locale}${itemPath ? `/${itemPath.replace(/^\//, "")}` : ""}`,
      icon: item.iconKey ?? "", column: 1, open_in_new_tab: item.openInNewTab === true, featured_image: null,
      children: (item.children ?? []).filter((child) => child.enabled !== false).map((child) => {
        const childPath = child.path ?? "";
        return {
          id: child.id ?? `${locale}-${childPath}`, title: child.title, description: child.description ?? "",
          url: childPath.startsWith("http") ? childPath : `/${locale}${childPath ? `/${childPath.replace(/^\//, "")}` : ""}`,
          icon: child.iconKey ?? "", column: 1, open_in_new_tab: child.openInNewTab === true, featured_image: null, children: [],
        };
      }),
    };
  });
}

export const cms = {
  home: (locale: Locale, draft = false) => contentByPath(locale, "", draft),
  content: contentByPath,
  collection,
  settings: cache(async (locale: Locale): Promise<SiteSettings> => {
    const payload = await payloadClient();
    const value: SiteSetting = await payload.findGlobal({ slug: "site-settings", locale, fallbackLocale: false, depth: 1, overrideAccess: true });
    return {
      brand_name: value.brandName, phone: value.phone ?? "", email: value.email ?? "", default_locale: defaultLocale,
      customer_portal_url: value.customerPortalURL ?? "", location: value.locationLabel ?? "", address: value.address ?? "",
      seo: { title: value.defaultSEOTitle ?? value.brandName, description: value.defaultSEODescription ?? "" }, logo_url: mediaURL(value.logo),
    };
  }),
  designSettings: cache(async (): Promise<Pick<DesignSetting, "primary" | "secondary" | "accent" | "background" | "surface" | "foreground" | "muted" | "radiusSmall" | "radiusMedium" | "radiusLarge" | "containerWidth" | "sectionSpacing" | "motionEnabled">> => {
    const payload = await payloadClient();
    return payload.findGlobal({ slug: "design-settings", depth: 0, overrideAccess: true });
  }),
  navigation: cache(async (location: "header" | "footer" | "mobile", locale: Locale) => {
    const payload = await payloadClient();
    const navigation = await payload.findGlobal({ slug: "navigation", locale, fallbackLocale: false, depth: 1, overrideAccess: true });
    return mapNavigation(navigation[location] ?? [], locale);
  }),
  search: cache(async (locale: Locale, query: string): Promise<SearchResult[]> => {
    const normalized = normalizeSearchText(query);
    if (normalized.length < 2) return [];
    const payload = await payloadClient();
    const result = await payload.find({ collection: "content", locale, fallbackLocale: false, limit: 30, depth: 0, overrideAccess: true, where: publishedWhere({ searchText: { contains: normalized } }) });
    return result.docs.map((document) => ({ kind: document.kind, title: document.title, summary: document.excerpt ?? "", url: `/${locale}${document.path ? `/${document.path}` : ""}` }));
  }),
};
