import type { Content, SiteSetting } from "@/payload-types";
import type { Payload, Where } from "payload";
import { locales } from "./locales";
import { redirectKey } from "./redirect-policy";
import { contentTypeFor, type SeoDocumentInput, type SeoSchemaInput, type SeoSiteInput, type TranslationAvailability } from "./seo-contract";
import type { Locale } from "./types";
import { validatePath } from "./public-url";
import { defaultLocale, siteURL } from "./site-config";

export type LoadedSeoDocument = { document: SeoDocumentInput; site: SeoSiteInput };

export function siteSeoInput(settings: SiteSetting): SeoSiteInput {
  return {
    origin: siteURL(),
    defaultLocale,
    title: settings.defaultSEOTitle ?? settings.brandName,
    description: settings.defaultSEODescription ?? "",
    brandName: settings.brandName,
    logo: settings.logo ?? null,
  };
}

export async function loadSiteSeo(payload: Payload, locale: Locale): Promise<SeoSiteInput> {
  const settings = await payload.findGlobal({ slug: "site-settings", locale, fallbackLocale: false, depth: 1, overrideAccess: true });
  return siteSeoInput(settings);
}

function schemaInput(document: Content, locale: Locale): SeoSchemaInput {
  const type = contentTypeFor(document);
  const path = document.path ?? "";
  const segments = path ? path.split("/") : [];
  const breadcrumbs = segments.length
    ? [
        { label: "Home", path: `/${locale}` },
        ...segments.map((segment, index) => ({
          label: index === segments.length - 1 ? document.title : segment,
          path: `/${locale}/${segments.slice(0, index + 1).join("/")}`,
        })),
      ]
    : [];
  const visibleFaqs = (document.layout ?? []).flatMap((block) => block.blockType === "faq" && block.enabled !== false
    ? (block.items ?? []).map((item) => ({ question: item.question, answer: item.answer }))
    : []);
  if (type === "editorial") return { type: "article", breadcrumbs, visibleFaqs };
  if (type === "service" || type === "independent-service") {
    return { type: "service", breadcrumbs, visibleFaqs, service: { name: document.title, description: document.excerpt ?? "" } };
  }
  return { type: "page", breadcrumbs, visibleFaqs };
}

export function seoDocumentInputFromContent({
  content,
  locale,
  translations,
  preview = false,
  authorized = false,
  isRedirectSource = false,
}: {
  content: Content;
  locale: Locale;
  translations: TranslationAvailability[];
  preview?: boolean;
  authorized?: boolean;
  isRedirectSource?: boolean;
}): SeoDocumentInput {
  const seo = content.seo;
  return {
    identity: { id: content.id, key: content.key, contentType: contentTypeFor(content), templateKey: content.templateKey, locale, slug: content.slug, path: content.path ?? "" },
    content: { title: content.title, excerpt: content.excerpt ?? null, blocks: content.layout ?? [], h1: content.title },
    seo: {
      title: seo?.title ?? null,
      description: seo?.description ?? null,
      canonicalOverride: seo?.canonicalURL ?? null,
      canonicalOverrideEnabled: seo?.canonicalOverrideEnabled === true,
      robotsIndex: seo?.robotsIndex !== false,
      robotsFollow: seo?.robotsFollow !== false,
      socialTitle: seo?.ogTitle ?? null,
      socialDescription: seo?.ogDescription ?? null,
      socialImage: seo?.ogImage ?? null,
    },
    workflow: {
      status: content._status === "draft" ? "draft" : "published",
      workflowStatus: content.workflowStatus,
      isActive: content.isActive !== false,
      isDeleted: false,
      isRedirectSource,
    },
    translations,
    preview: { enabled: preview, authorized },
    schema: schemaInput(content, locale),
  };
}

export async function loadSeoDocument(
  payload: Payload,
  locale: Locale,
  path: string,
  { preview = false, authorized = false }: { preview?: boolean; authorized?: boolean } = {},
): Promise<LoadedSeoDocument | null> {
  if (preview && !authorized) return null;
  const where: Where = preview
    ? { path: { equals: path } }
    : { and: [{ path: { equals: path } }, { _status: { equals: "published" } }, { isActive: { equals: true } }] };
  const result = await payload.find({
    collection: "content",
    locale,
    fallbackLocale: false,
    depth: 1,
    limit: 1,
    draft: preview,
    overrideAccess: true,
    where,
  });
  const content = result.docs[0];
  if (!content) return null;

  const otherLocales = locales.filter((candidate) => candidate !== locale);
  const [otherTranslations, site, redirectSources] = await Promise.all([
    Promise.all(otherLocales.map((candidate) => payload.findByID({
      collection: "content",
      id: content.id,
      locale: candidate,
      fallbackLocale: false,
      depth: 0,
      draft: false,
      overrideAccess: true,
    }))),
    loadSiteSeo(payload, locale),
    payload.find({
      collection: "seo-redirects",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { and: [{ sourceKey: { equals: redirectKey(locale, path) } }, { enabled: { equals: true } }] },
    }),
  ]);

  const translations: TranslationAvailability[] = [
    { locale, document: content },
    ...otherLocales.map((candidate, index) => ({ locale: candidate, document: otherTranslations[index] })),
  ].map(({ locale: candidate, document }) => {
    const translatedPath = typeof document.path === "string" ? document.path : null;
    const validation = translatedPath === null ? null : validatePath(translatedPath);
    return {
      locale: candidate,
      path: translatedPath,
      isPublished: document._status === "published",
      isActive: document.isActive !== false,
      isRouteValid: Boolean(validation?.valid && validation.normalizedPath === translatedPath),
      hasUniquePath: true,
    };
  });

  return {
    site,
    document: seoDocumentInputFromContent({ content, locale, translations, preview, authorized, isRedirectSource: redirectSources.totalDocs > 0 }),
  };
}
