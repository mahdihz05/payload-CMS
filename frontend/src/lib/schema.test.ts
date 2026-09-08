import { describe, expect, it } from "vitest";
import { organizationSchemas, schemasForResolvedSeo, serializeJsonLd } from "./schema";
import type { ResolvedSeo } from "./seo-resolver";

const seo: ResolvedSeo = {
  site: { brandName: "Example Site", origin: "https://example.com" },
  title: "Service | Example Site",
  titleBase: "Service",
  description: "Description",
  canonical: "https://example.com/en/services/example",
  isSelfCanonical: true,
  robots: { index: true, follow: true },
  social: { title: "Service", description: "Description", image: null, locale: "en" },
  alternates: { languages: {}, xDefault: null },
  sitemapEligible: true,
  schema: { type: "service", service: { name: "Service", description: "Description" }, breadcrumbs: [] },
};

describe("structured data builders", () => {
  it("builds trusted Organization and WebSite schema", () => {
    const schemas = organizationSchemas({ brandName: "Example Site", siteUrl: "https://example.com", phone: "123" });
    expect(schemas.map((schema) => schema["@type"])).toEqual(["Organization", "WebSite"]);
    expect(schemas).toMatchInlineSnapshot(`
      [
        {
          "@context": "https://schema.org",
          "@id": "https://example.com#organization",
          "@type": "Organization",
          "name": "Example Site",
          "telephone": "123",
          "url": "https://example.com",
        },
        {
          "@context": "https://schema.org",
          "@id": "https://example.com#website",
          "@type": "WebSite",
          "name": "Example Site",
          "publisher": {
            "@id": "https://example.com#organization",
          },
          "url": "https://example.com",
        },
      ]
    `);
  });

  it("builds only typed eligible page schema", () => {
    expect(schemasForResolvedSeo(seo, "Example Site", "https://example.com")[0]).toMatchObject({ "@type": "Service", url: seo.canonical });
    expect(schemasForResolvedSeo({ ...seo, schema: null }, "Example Site", "https://example.com")).toEqual([]);
    const faq = schemasForResolvedSeo({
      ...seo,
      schema: { ...seo.schema!, visibleFaqs: [{ question: "Visible?", answer: "Yes." }] },
    }, "Example Site", "https://example.com");
    expect(faq.map((item) => item["@type"])).toContain("FAQPage");
  });

  it("escapes script-breaking markup", () => {
    expect(serializeJsonLd({ value: "</script>" })).not.toContain("</script>");
  });
});
