import { describe, expect, it } from "vitest";
import type { SeoDocumentInput, SeoSiteInput } from "./seo-contract";
import { resolveSeo, SeoResolutionError } from "./seo-resolver";

const site: SeoSiteInput = {
  origin: "https://example.com",
  defaultLocale: "en",
  title: "Site default",
  description: "Site description",
  brandName: "Example Site",
  logo: null,
};

const document: SeoDocumentInput = {
  identity: { id: 1, key: "about", contentType: "page", templateKey: "about", locale: "en", slug: "about", path: "about" },
  content: { title: "About", excerpt: "About excerpt", blocks: [], h1: "About" },
  seo: {
    title: "SEO About",
    description: "SEO description",
    canonicalOverride: null,
    canonicalOverrideEnabled: false,
    robotsIndex: true,
    robotsFollow: true,
    socialTitle: null,
    socialDescription: null,
    socialImage: null,
  },
  workflow: { status: "published", workflowStatus: "published", isActive: true, isDeleted: false, isRedirectSource: false },
  translations: [
    { locale: "fa", path: "about", isPublished: true, isActive: true, isRouteValid: true, hasUniquePath: true },
    { locale: "en", path: "about", isPublished: true, isActive: true, isRouteValid: true, hasUniquePath: true },
    { locale: "ar-ae", path: null, isPublished: false, isActive: true, isRouteValid: false, hasUniquePath: true },
  ],
  preview: { enabled: false, authorized: false },
  schema: { type: "page", breadcrumbs: [{ label: "About", path: "about" }] },
};

describe("resolveSeo", () => {
  it("uses SEO, document, then site fallbacks and applies the title template once", () => {
    expect(resolveSeo(document, site)).toMatchObject({ title: "SEO About | Example Site", description: "SEO description" });
    expect(resolveSeo({ ...document, seo: { ...document.seo, title: null, description: null } }, site)).toMatchObject({
      title: "About | Example Site",
      description: "About excerpt",
    });
    expect(resolveSeo({ ...document, content: { ...document.content, title: "", excerpt: null }, seo: { ...document.seo, title: null, description: null } }, site)).toMatchObject({
      title: "Site default | Example Site",
      description: "Site description",
    });
  });

  it("builds self canonical and accepts only an explicitly enabled valid override", () => {
    expect(resolveSeo(document, site)).toMatchObject({ canonical: "https://example.com/en/about", isSelfCanonical: true, sitemapEligible: true });
    const external = resolveSeo({ ...document, seo: { ...document.seo, canonicalOverrideEnabled: true, canonicalOverride: "https://example.com/about" } }, site);
    expect(external).toMatchObject({ canonical: "https://example.com/about", isSelfCanonical: false, sitemapEligible: false });
    expect(() => resolveSeo({ ...document, seo: { ...document.seo, canonicalOverrideEnabled: true, canonicalOverride: "/about" } }, site)).toThrow(SeoResolutionError);
  });

  it("forces authorized preview and draft output to noindex,nofollow", () => {
    const preview = resolveSeo({ ...document, preview: { enabled: true, authorized: true } }, site);
    expect(preview).toMatchObject({ robots: { index: false, follow: false }, sitemapEligible: false });
    const draft = resolveSeo({ ...document, workflow: { ...document.workflow, status: "draft" } }, site);
    expect(draft.robots).toEqual({ index: false, follow: false });
    expect(() => resolveSeo({ ...document, preview: { enabled: true, authorized: false } }, site)).toThrow(SeoResolutionError);
  });

  it("applies inactive, archived, redirect, and search system indexability rules", () => {
    expect(resolveSeo({ ...document, workflow: { ...document.workflow, isActive: false } }, site).sitemapEligible).toBe(false);
    expect(resolveSeo({ ...document, workflow: { ...document.workflow, workflowStatus: "archived" } }, site).robots.index).toBe(false);
    expect(resolveSeo({ ...document, workflow: { ...document.workflow, isRedirectSource: true } }, site).sitemapEligible).toBe(false);
    expect(resolveSeo(document, site, { surface: "search" }).robots).toEqual({ index: false, follow: true });
  });

  it("emits only available translations and omits x-default without the default locale", () => {
    const resolved = resolveSeo(document, site);
    expect(resolved.alternates.languages).toEqual({ fa: "https://example.com/fa/about", en: "https://example.com/en/about" });
    expect(resolved.alternates.xDefault).toBe("https://example.com/en/about");
    const withoutDefault = resolveSeo({ ...document, translations: document.translations.filter((translation) => translation.locale !== "en") }, site);
    expect(withoutDefault.alternates.xDefault).toBeNull();
  });

  it("uses social fallbacks and localized media ALT", () => {
    const resolved = resolveSeo({
      ...document,
      seo: { ...document.seo, socialImage: { id: 1, alt: "Localized ALT", url: "/media/image.jpg", updatedAt: "", createdAt: "" } },
    }, site);
    expect(resolved.social).toMatchObject({ title: "SEO About", description: "SEO description", image: { url: "/media/image.jpg", alt: "Localized ALT" }, locale: "en" });
  });

  it("emits schema only when typed facts are sufficient", () => {
    expect(resolveSeo(document, site).schema?.type).toBe("page");
    expect(resolveSeo({ ...document, schema: { type: "article", breadcrumbs: [] } }, site).schema).toBeNull();
  });
});
