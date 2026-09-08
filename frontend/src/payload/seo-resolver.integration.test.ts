import { createRequire } from "node:module";
import { beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import { loadSeoDocument } from "@/lib/seo-loader";
import { resolveSeo } from "@/lib/seo-resolver";
import { buildSeoSitemap } from "@/lib/seo-sitemap";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const enabled = process.env.RUN_PAYLOAD_INTEGRATION === "1";
let payload: Payload;

describe.skipIf(!enabled)("Payload document SEO resolution", () => {
  beforeAll(async () => {
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
  });

  it("loads one localized document and resolves verified public SEO", async () => {
    const loaded = await loadSeoDocument(payload, "fa", "contact");
    expect(loaded).not.toBeNull();
    const resolved = resolveSeo(loaded!.document, loaded!.site);

    expect(resolved.canonical).toBe(`${loaded!.site.origin}/fa/contact`);
    expect(resolved.robots).toEqual({ index: true, follow: true });
    expect(resolved.alternates.languages).toHaveProperty("fa");
    expect(resolved.alternates.languages).toHaveProperty("en");
    expect(resolved.alternates.languages).toHaveProperty("ar-AE");
    expect(resolved.sitemapEligible).toBe(true);
  });

  it("does not load an unauthorized draft preview", async () => {
    await expect(loadSeoDocument(payload, "fa", "contact", { preview: true, authorized: false })).resolves.toBeNull();
  });

  it("builds a unique indexable-only sitemap without unavailable translations", async () => {
    const sitemap = await buildSeoSitemap(payload);
    const urls = sitemap.map((entry) => entry.url);
    expect(urls.length).toBeGreaterThan(0);
    expect(new Set(urls).size).toBe(urls.length);
    expect(sitemap.every((entry) => entry.lastModified)).toBe(true);
  });
});
