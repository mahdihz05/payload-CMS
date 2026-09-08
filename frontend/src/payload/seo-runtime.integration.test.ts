import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import type { PayloadJob } from "@/payload-types";
import { loadSeoDocument } from "@/lib/seo-loader";
import { resolveSeo } from "@/lib/seo-resolver";
import { buildSeoSitemap } from "@/lib/seo-sitemap";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const enabled = process.env.RUN_PAYLOAD_INTEGRATION === "1";
const suffix = `${Date.now()}`;
const routePath = `scheduled-${suffix}`;
let payload: Payload;
let contentID: number | undefined;
let job: PayloadJob | undefined;

describe.skipIf(!enabled)("SEO runtime workflow", () => {
  beforeAll(async () => {
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    const stale = await payload.find({ collection: "content", overrideAccess: true, limit: 100, where: { key: { contains: "scheduled-" } } });
    for (const item of stale.docs.filter((item) => item.key.startsWith("scheduled-"))) {
      await payload.delete({ collection: "content", id: item.id, overrideAccess: true });
    }
  });

  afterAll(async () => {
    if (!payload) return;
    if (job) {
      const queued = await payload.find({ collection: "payload-jobs", overrideAccess: true, where: { id: { equals: job.id } } });
      if (queued.docs[0]) await payload.delete({ collection: "payload-jobs", id: job.id, overrideAccess: true });
    }
    if (contentID) await payload.delete({ collection: "content", id: contentID, overrideAccess: true });
  });

  it("keeps anonymous draft access closed and resolves authorized preview as noindex,nofollow", async () => {
    const content = await payload.create({
      collection: "content", locale: "en", draft: true, overrideAccess: true,
      data: { key: routePath, kind: "page", templateKey: "default", title: "Scheduled draft", excerpt: "Draft description", slug: routePath, path: routePath, _status: "draft" },
    });
    contentID = content.id;

    await expect(loadSeoDocument(payload, "en", routePath)).resolves.toBeNull();
    await expect(loadSeoDocument(payload, "en", routePath, { preview: true, authorized: false })).resolves.toBeNull();
    const preview = await loadSeoDocument(payload, "en", routePath, { preview: true, authorized: true });
    expect(preview).not.toBeNull();
    expect(resolveSeo(preview!.document, preview!.site).robots).toEqual({ index: false, follow: false });
  });

  it("runs Payload's schedulePublish task and exposes the resulting indexable page", async () => {
    job = await payload.jobs.queue({
      task: "schedulePublish",
      input: { doc: { relationTo: "content", value: contentID! }, locale: "en", type: "publish" },
      waitUntil: new Date(Date.now() - 1000),
      overrideAccess: true,
    });
    await payload.jobs.runByID({ id: job.id, overrideAccess: true });

    const published = await payload.findByID({ collection: "content", id: contentID!, locale: "en", fallbackLocale: false, draft: false, overrideAccess: true });
    expect(published._status).toBe("published");
    const loaded = await loadSeoDocument(payload, "en", routePath);
    expect(loaded).not.toBeNull();
    expect(resolveSeo(loaded!.document, loaded!.site)).toMatchObject({ robots: { index: true, follow: true }, sitemapEligible: true });
    expect((await buildSeoSitemap(payload)).map((entry) => entry.url)).toContain(`${loaded!.site.origin}/en/${routePath}`);
  });
});
