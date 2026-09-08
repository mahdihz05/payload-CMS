import { localeMeta } from "./locales";
import { buildCanonicalSelfUrl, isPublicContentIndexable, validateCanonicalOverride, validatePath } from "./public-url";
import type { SeoDocumentInput, SeoSchemaInput, SeoSiteInput } from "./seo-contract";

export type SeoSurface = "page" | "search" | "non-public";

export type ResolvedSeo = {
  site: { brandName: string; origin: string };
  title: string;
  titleBase: string;
  description: string;
  canonical: string;
  isSelfCanonical: boolean;
  robots: { index: boolean; follow: boolean };
  social: {
    title: string;
    description: string;
    image: { url: string; alt: string } | null;
    locale: string;
  };
  alternates: { languages: Partial<Record<string, string>>; xDefault: string | null };
  sitemapEligible: boolean;
  schema: SeoSchemaInput | null;
};

export class SeoResolutionError extends Error {}

function present(...values: (string | null | undefined)[]): string {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() ?? "";
}

function applyTitleTemplate(title: string, brandName: string): string {
  const brand = brandName.trim();
  if (!brand || title.toLocaleLowerCase() === brand.toLocaleLowerCase() || title.endsWith(` | ${brand}`)) return title;
  return `${title} | ${brand}`;
}

function mediaValue(value: SeoDocumentInput["seo"]["socialImage"] | SeoSiteInput["logo"]) {
  if (!value || typeof value !== "object" || !value.url) return null;
  return { url: value.url, alt: present(value.alt) };
}

function eligibleSchema(schema: SeoSchemaInput, publicOutput: boolean): SeoSchemaInput | null {
  if (!publicOutput) return null;
  if (schema.type === "article" && !schema.article) return null;
  if (schema.type === "service" && !schema.service) return null;
  if (schema.type === "product" && !schema.product) return null;
  return { ...schema, visibleFaqs: schema.visibleFaqs?.filter((faq) => faq.question.trim() && faq.answer.trim()) };
}

export function resolveSeo(
  document: SeoDocumentInput,
  site: SeoSiteInput,
  { surface = "page" }: { surface?: SeoSurface } = {},
): ResolvedSeo {
  if (document.preview.enabled && !document.preview.authorized) {
    throw new SeoResolutionError("Unauthorized preview input cannot be resolved");
  }

  const pathValidation = validatePath(document.identity.path);
  const currentTranslation = document.translations.find((translation) => translation.locale === document.identity.locale);
  const routeValid = pathValidation.valid && pathValidation.normalizedPath === document.identity.path && currentTranslation?.isRouteValid !== false;
  const hasUniquePath = currentTranslation?.hasUniquePath !== false;
  const titleBase = present(document.seo.title, document.content.title, site.title);
  const description = present(document.seo.description, document.content.excerpt, site.description);
  const selfCanonical = buildCanonicalSelfUrl(site.origin, document.identity.locale, document.identity.path);

  let canonical = selfCanonical;
  if (document.seo.canonicalOverrideEnabled) {
    const override = validateCanonicalOverride(document.seo.canonicalOverride ?? "");
    if (!override.valid) throw new SeoResolutionError(`Invalid canonical override: ${override.error}`);
    canonical = override.url;
  }
  const isSelfCanonical = canonical === selfCanonical;

  let index = document.seo.robotsIndex;
  let follow = document.seo.robotsFollow;
  const archived = document.workflow.workflowStatus === "archived";
  const unavailable = !routeValid || !hasUniquePath || currentTranslation?.isPublished === false || currentTranslation?.isActive === false;
  if (
    document.preview.enabled || document.workflow.status !== "published" || !document.workflow.isActive || archived ||
    surface === "non-public" || document.workflow.isDeleted || document.workflow.isRedirectSource || unavailable
  ) {
    index = false;
    follow = false;
  }
  if (surface === "search") {
    index = false;
    follow = true;
  }

  const languages: Partial<Record<string, string>> = {};
  for (const translation of document.translations) {
    if (!translation.path || !translation.isPublished || !translation.isActive || !translation.isRouteValid || !translation.hasUniquePath) continue;
    languages[localeMeta[translation.locale].lang] = buildCanonicalSelfUrl(site.origin, translation.locale, translation.path);
  }
  const xDefault = languages[localeMeta[site.defaultLocale].lang] ?? null;
  const image = mediaValue(document.seo.socialImage) ?? mediaValue(site.logo);
  const socialTitle = present(document.seo.socialTitle, document.seo.title, document.content.title, site.title);
  const socialDescription = present(document.seo.socialDescription, document.seo.description, document.content.excerpt, site.description);
  if (image && !image.alt) image.alt = socialTitle;

  const sitemapEligible = surface === "page" && !document.preview.enabled && isPublicContentIndexable({
    isPublished: document.workflow.status === "published",
    isActive: document.workflow.isActive && !archived,
    hasUniquePath,
    isRouteValid: routeValid && currentTranslation?.isPublished !== false && currentTranslation?.isActive !== false,
    isSelfCanonical,
    robotsIndex: index,
    isRedirectSource: document.workflow.isRedirectSource,
    isDeleted: document.workflow.isDeleted,
  });

  return {
    site: { brandName: site.brandName, origin: new URL(site.origin).origin },
    title: applyTitleTemplate(titleBase, site.brandName),
    titleBase,
    description,
    canonical,
    isSelfCanonical,
    robots: { index, follow },
    social: { title: socialTitle, description: socialDescription, image, locale: localeMeta[document.identity.locale].lang },
    alternates: { languages, xDefault },
    sitemapEligible,
    schema: eligibleSchema(document.schema, routeValid && !document.workflow.isDeleted),
  };
}
