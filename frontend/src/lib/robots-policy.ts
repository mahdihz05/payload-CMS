import type { MetadataRoute } from "next";

export function robotsPolicy(siteUrl: string, production: boolean): MetadataRoute.Robots {
  const site = new URL(siteUrl).origin;
  if (!production) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
