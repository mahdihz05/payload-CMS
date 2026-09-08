import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import type { Content, User } from "@/payload-types";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const enabled = process.env.RUN_SEO_E2E === "1";
const baseUrl = process.env.SEO_E2E_BASE_URL ?? "http://127.0.0.1:3100";
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").origin;
const suffix = `${Date.now()}`;
const oldPath = `e2e-seo-${suffix}`;
const newPath = `${oldPath}-moved`;
const password = "Test-only-password-123!";
let payload: Payload;
let content: Content;
let admin: User;
let cookie = "";

function headValue(html: string, expression: RegExp): string | null {
  return html.match(expression)?.[1] ?? null;
}

async function html(path: string, authenticated = false) {
  return fetch(`${baseUrl}${path}`, { headers: authenticated ? { cookie } : undefined });
}

async function updateContent(data: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/api/content/${content.id}?locale=en&draft=false`, {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(data),
  });
  expect(response.status, await response.text()).toBe(200);
}

describe.skipIf(!enabled)("production SEO HTTP", () => {
  beforeAll(async () => {
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    admin = await payload.create({
      collection: "users", overrideAccess: true,
      data: { email: `seo-e2e-${suffix}@example.test`, password, name: "SEO E2E", role: "admin" },
    });
    content = await payload.create({
      collection: "content", locale: "en", draft: true, overrideAccess: true,
      data: {
        key: oldPath, kind: "page", templateKey: "default", title: "Draft fixture", excerpt: "Draft description",
        slug: oldPath, path: oldPath, _status: "draft", seo: { title: "Draft SEO" },
        layout: [{ blockType: "hero", title: "DRAFT BODY", body: "Draft visible body", primaryCTA: {}, secondaryCTA: {} }],
      },
    });
    const login = await fetch(`${baseUrl}/api/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: admin.email, password }),
    });
    expect(login.status).toBe(200);
    cookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
    expect(cookie).toContain("payload-token=");
  }, 30_000);

  afterAll(async () => {
    if (!payload) return;
    const redirects = await payload.find({ collection: "seo-redirects", overrideAccess: true, where: { sourcePath: { equals: oldPath } } });
    for (const redirect of redirects.docs) await payload.delete({ collection: "seo-redirects", id: redirect.id, overrideAccess: true });
    if (content) await payload.delete({ collection: "content", id: content.id, overrideAccess: true });
    if (admin) await payload.delete({ collection: "users", id: admin.id, overrideAccess: true });
  });

  it("preserves baseline statuses and emits locale SEO smoke output", async () => {
    expect((await fetch(baseUrl, { redirect: "manual" })).status).toBe(307);
    expect((await fetch(`${baseUrl}/does-not-exist`)).status).toBe(404);
    for (const locale of ["fa", "en", "ar-ae"]) {
      const response = await html(`/${locale}/contact`);
      const body = await response.text();
      expect(response.status).toBe(200);
      expect(headValue(body, /<link rel="canonical" href="([^"]+)"/)).toBe(`${canonicalOrigin}/${locale}/contact`);
      expect(body).toContain('name="twitter:title"');
      expect(body).toContain('type="application/ld+json"');
    }
    expect(await (await html("/en/contact")).text()).toContain('"@type":"BreadcrumbList"');
  }, 15_000);

  it("protects anonymous drafts and emits authenticated preview noindex,nofollow from draft data", async () => {
    expect((await html(`/en/${oldPath}?draft=1`)).status).toBe(404);
    const response = await html(`/en/${oldPath}?draft=1`, true);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain("DRAFT BODY");
    expect(headValue(body, /<meta name="robots" content="([^"]+)"/)).toBe("noindex, nofollow");
    expect(headValue(body, /<title>([^<]+)<\/title>/)).toBe("Draft SEO | Payload CMS Starter");
  });

  it("revalidates publish and SEO changes, then executes a one-hop path redirect", async () => {
    await updateContent({ _status: "published" });
    let response = await html(`/en/${oldPath}`);
    expect(response.status).toBe(200);

    await updateContent({ seo: { title: "Updated SEO" } });
    response = await html(`/en/${oldPath}`);
    expect(headValue(await response.text(), /<title>([^<]+)<\/title>/)).toBe("Updated SEO | Payload CMS Starter");

    await updateContent({ path: newPath, slug: newPath, _status: "published" });
    const redirected = await fetch(`${baseUrl}/en/${oldPath}`, { redirect: "manual" });
    expect(redirected.status).toBe(308);
    expect(new URL(redirected.headers.get("location")!, baseUrl).href).toBe(`${baseUrl}/en/${newPath}`);
    expect((await html(`/en/${newPath}`)).status).toBe(200);

    const sitemap = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
    expect(sitemap).toContain(`${canonicalOrigin}/en/${newPath}`);
    expect(sitemap).not.toContain(`${canonicalOrigin}/en/${oldPath}<`);
  }, 30_000);

  it("serves production robots and search noindex,follow", async () => {
    const robots = await (await fetch(`${baseUrl}/robots.txt`)).text();
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin/");
    const search = await (await html("/fa/search?q=cloud")).text();
    expect(headValue(search, /<meta name="robots" content="([^"]+)"/)).toBe("noindex, follow");
  });

  it("crawls every sitemap URL successfully without duplicates", async () => {
    const xml = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(urls.length).toBeGreaterThan(0);
    expect(new Set(urls).size).toBe(urls.length);
    for (let index = 0; index < urls.length; index += 10) {
      const statuses = await Promise.all(urls.slice(index, index + 10).map((url) => {
        const target = new URL(url);
        return fetch(`${baseUrl}${target.pathname}`).then((response) => response.status);
      }));
      expect(statuses.every((status) => status === 200)).toBe(true);
    }
  }, 120_000);
});
