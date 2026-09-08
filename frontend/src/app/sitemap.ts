import type { MetadataRoute } from "next";
import { getPayload } from "payload";
import { unstable_cache } from "next/cache";
import { buildSeoSitemap } from "@/lib/seo-sitemap";
import { SEO_CACHE_VERSION, SEO_SITEMAP_TAG } from "@/lib/seo-cache";

const cachedSitemap = unstable_cache(async () => {
  const { default: config } = await import("@/payload.config");
  return buildSeoSitemap(await getPayload({ config }));
}, ["seo-sitemap", SEO_CACHE_VERSION], { tags: [SEO_SITEMAP_TAG] });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    return await cachedSitemap();
  } catch (error) {
    console.error("Unable to build SEO sitemap", error);
    return [];
  }
}
