import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import { loadPublicRedirect } from "@/lib/redirect-service";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const enabled = process.env.RUN_PAYLOAD_INTEGRATION === "1";
const suffix = `${Date.now()}`;
const oldPath = `seo-test-${suffix}`;
const newPath = `seo-test-${suffix}-new`;
let payload: Payload;
let contentID: number | undefined;

describe.skipIf(!enabled)("SEO routing lifecycle", () => {
  beforeAll(async () => {
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
  });

  afterAll(async () => {
    if (!payload) return;
    const redirects = await payload.find({ collection: "seo-redirects", overrideAccess: true, where: { sourcePath: { contains: `seo-test-${suffix}` } } });
    await Promise.all(redirects.docs.map((redirect) => payload.delete({ collection: "seo-redirects", id: redirect.id, overrideAccess: true })));
    if (contentID) await payload.delete({ collection: "content", id: contentID, overrideAccess: true });
  });

  it("enforces localized uniqueness and creates a permanent redirect for a published path change", async () => {
    const content = await payload.create({
      collection: "content",
      locale: "en",
      draft: false,
      overrideAccess: true,
      data: {
        key: `seo-test-${suffix}`,
        kind: "page",
        templateKey: "default",
        isActive: true,
        title: "SEO routing test",
        slug: oldPath,
        path: oldPath,
        _status: "published",
      },
    });
    contentID = content.id;

    await expect(payload.create({
      collection: "content",
      locale: "en",
      draft: false,
      overrideAccess: true,
      data: {
        key: `seo-test-duplicate-${suffix}`,
        kind: "page",
        templateKey: "default",
        title: "Duplicate route",
        slug: `duplicate-${suffix}`,
        path: oldPath,
        _status: "published",
      },
    })).rejects.toThrow();

    await payload.update({
      collection: "content",
      id: content.id,
      locale: "en",
      draft: false,
      overrideAccess: true,
      data: { path: newPath, slug: `${oldPath}-new`, _status: "published" },
    });

    const redirects = await payload.find({ collection: "seo-redirects", overrideAccess: true, depth: 0, where: { sourceKey: { equals: `en:${oldPath}` } } });
    expect(redirects.docs).toHaveLength(1);
    expect(redirects.docs[0]).toMatchObject({
      sourceLocale: "en",
      sourcePath: oldPath,
      status: "308",
      enabled: true,
      to: { type: "content", content: content.id, locale: "en" },
    });
    await expect(loadPublicRedirect("en", oldPath)).resolves.toEqual({ destination: `/en/${newPath}`, status: 308 });
  });

  it("rejects a canonical path reserved by a redirect source", async () => {
    await expect(payload.update({
      collection: "content",
      id: contentID!,
      locale: "en",
      draft: false,
      overrideAccess: true,
      data: { path: oldPath, _status: "published" },
    })).rejects.toThrow();
  });
});
