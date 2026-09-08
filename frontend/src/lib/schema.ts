import type { ResolvedSeo } from "./seo-resolver";

export type JsonLdValue = Record<string, unknown>;

export function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationSchemas(settings: {
  brandName: string;
  siteUrl: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}): JsonLdValue[] {
  const organization: JsonLdValue = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${settings.siteUrl}#organization`,
    name: settings.brandName,
    url: settings.siteUrl,
  };
  if (settings.logoUrl) organization.logo = settings.logoUrl;
  if (settings.phone) organization.telephone = settings.phone;
  if (settings.email) organization.email = settings.email;
  if (settings.address) organization.address = { "@type": "PostalAddress", streetAddress: settings.address };
  return [
    organization,
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${settings.siteUrl}#website`, url: settings.siteUrl, name: settings.brandName, publisher: { "@id": `${settings.siteUrl}#organization` } },
  ];
}

export function schemasForResolvedSeo(seo: ResolvedSeo, brandName: string, siteUrl: string): JsonLdValue[] {
  if (!seo.schema) return [];
  const schemas: JsonLdValue[] = [];
  const provider = { "@type": "Organization", name: brandName, url: siteUrl };
  if (seo.schema.type === "article" && seo.schema.article) {
    schemas.push({
      "@context": "https://schema.org", "@type": "Article", headline: seo.titleBase, description: seo.description,
      url: seo.canonical, datePublished: seo.schema.article.publishedAt, dateModified: seo.schema.article.modifiedAt ?? undefined,
      author: { "@type": "Person", name: seo.schema.article.authorName }, publisher: provider,
    });
  }
  if (seo.schema.type === "service" && seo.schema.service) {
    schemas.push({ "@context": "https://schema.org", "@type": "Service", name: seo.schema.service.name, description: seo.schema.service.description, url: seo.canonical, provider });
  }
  if (seo.schema.type === "product" && seo.schema.product) {
    schemas.push({
      "@context": "https://schema.org", "@type": "Product", name: seo.schema.product.name, description: seo.schema.product.description,
      url: seo.canonical, offers: { "@type": "Offer", price: seo.schema.product.price, priceCurrency: seo.schema.product.currency },
    });
  }
  if (seo.schema.breadcrumbs.length > 1) {
    schemas.push({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: seo.schema.breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, item: new URL(item.path, siteUrl).href })),
    });
  }
  if (seo.schema.visibleFaqs?.length) {
    schemas.push({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: seo.schema.visibleFaqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
    });
  }
  return schemas;
}
