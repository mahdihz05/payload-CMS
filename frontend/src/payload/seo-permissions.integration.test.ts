import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import type { Content, SeoRedirect, User } from "@/payload-types";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const enabled = process.env.RUN_PAYLOAD_INTEGRATION === "1";
const suffix = `${Date.now()}`;
let payload: Payload;
let content: Content;
let seoUser: User;
let editorUser: User;
let viewerUser: User;
let redirect: SeoRedirect | undefined;

describe.skipIf(!enabled)("SEO role API enforcement", () => {
  beforeAll(async () => {
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    [seoUser, editorUser, viewerUser] = await Promise.all([
      payload.create({ collection: "users", overrideAccess: true, data: { email: `seo-${suffix}@example.test`, password: "Test-only-password-123!", name: "SEO test", role: "seo" } }),
      payload.create({ collection: "users", overrideAccess: true, data: { email: `editor-${suffix}@example.test`, password: "Test-only-password-123!", name: "Editor test", role: "editor" } }),
      payload.create({ collection: "users", overrideAccess: true, data: { email: `viewer-${suffix}@example.test`, password: "Test-only-password-123!", name: "Viewer test", role: "viewer" } }),
    ]);
    content = await payload.create({
      collection: "content", locale: "en", draft: false, overrideAccess: true,
      data: { key: `seo-permission-${suffix}`, kind: "page", templateKey: "default", title: "Permission fixture", slug: `permission-${suffix}`, path: `permission-${suffix}`, _status: "published" },
    });
  });

  afterAll(async () => {
    if (!payload) return;
    if (redirect) await payload.delete({ collection: "seo-redirects", id: redirect.id, overrideAccess: true });
    if (content) await payload.delete({ collection: "content", id: content.id, overrideAccess: true });
    for (const user of [seoUser, editorUser, viewerUser].filter(Boolean)) await payload.delete({ collection: "users", id: user.id, overrideAccess: true });
    const logs = await payload.find({ collection: "audit-logs", overrideAccess: true, limit: 1000, where: { objectID: { in: [String(content?.id), String(redirect?.id)] } } });
    await Promise.all(logs.docs.map((log) => payload.delete({ collection: "audit-logs", id: log.id, overrideAccess: true })));
  });

  it("allows SEO fields but denies body, URL, and publication changes", async () => {
    const updated = await payload.update({
      collection: "content", id: content.id, locale: "en", overrideAccess: false, user: seoUser,
      data: { seo: { title: "SEO-only title", robotsIndex: false } },
    });
    expect(updated.seo).toMatchObject({ title: "SEO-only title", robotsIndex: false });
    await expect(payload.update({
      collection: "content", id: content.id, locale: "en", overrideAccess: false, user: seoUser,
      data: { seo: { canonicalURL: "/relative", canonicalOverrideEnabled: true } },
    })).rejects.toThrow();

    await expect(payload.update({
      collection: "content", id: content.id, locale: "en", overrideAccess: false, user: seoUser,
      data: { title: "Forbidden title", path: `forbidden-${suffix}`, _status: "draft" },
    })).rejects.toThrow();
    const unchanged = await payload.findByID({ collection: "content", id: content.id, locale: "en", overrideAccess: true });
    expect(unchanged).toMatchObject({ title: "Permission fixture", path: `permission-${suffix}`, _status: "published" });
  });

  it("allows disabled redirect drafts but denies activation and deletion", async () => {
    redirect = await payload.create({
      collection: "seo-redirects", overrideAccess: false, user: seoUser,
      data: {
        sourceLocale: "en", sourcePath: `permission-old-${suffix}`, sourceKey: `en:permission-old-${suffix}`,
        to: { type: "content", content: content.id, locale: "en" }, status: "308", enabled: false,
      },
    });
    await expect(payload.update({ collection: "seo-redirects", id: redirect.id, overrideAccess: false, user: seoUser, data: { enabled: true } })).rejects.toThrow();
    await expect(payload.delete({ collection: "seo-redirects", id: redirect.id, overrideAccess: false, user: seoUser })).rejects.toThrow();
  });

  it("preserves editor authority and viewer read-only behavior", async () => {
    const edited = await payload.update({ collection: "content", id: content.id, locale: "en", overrideAccess: false, user: editorUser, data: { title: "Editor title" } });
    expect(edited.title).toBe("Editor title");
    await expect(payload.update({ collection: "content", id: content.id, locale: "en", overrideAccess: false, user: viewerUser, data: { seo: { title: "No" } } })).rejects.toThrow();
  });
});
