import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { getPayload } from "payload";
import { locales } from "@/lib/locales";
import { buildSeoMigrationInventory, seoInventoryMarkdown, type SeoInventoryInput } from "@/lib/seo-migration-inventory";
import { siteURL } from "@/lib/site-config";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    throw new Error("DATABASE_URI and PAYLOAD_SECRET are required");
  }

  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });
  const inputs: SeoInventoryInput[] = [];
  for (const locale of locales) {
    const result = await payload.find({
      collection: "content",
      locale,
      fallbackLocale: false,
      draft: true,
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      sort: "key",
    });
    for (const document of result.docs) {
      inputs.push({
        id: document.id,
        key: document.key,
        locale,
        templateKey: document.templateKey,
        slug: typeof document.slug === "string" ? document.slug : null,
        path: typeof document.path === "string" ? document.path : null,
        seoTitle: document.seo?.title ?? null,
        seoDescription: document.seo?.description ?? null,
        canonicalOverride: document.seo?.canonicalURL ?? null,
        robotsIndex: document.seo?.robotsIndex !== false,
        robotsFollow: document.seo?.robotsFollow !== false,
        status: document._status === "draft" ? "draft" : "published",
        isActive: document.isActive !== false,
      });
    }
  }

  const siteUrl = process.env.SEO_INVENTORY_SITE_URL ?? siteURL();
  const report = buildSeoMigrationInventory(inputs, siteUrl);
  const outputDirectory = path.resolve(process.cwd(), "../docs/seo");
  await fs.writeFile(path.join(outputDirectory, "SEO_MIGRATION_INVENTORY.json"), `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(path.join(outputDirectory, "SEO_MIGRATION_INVENTORY_SUMMARY.md"), seoInventoryMarkdown(report));
  console.log(JSON.stringify(report.summary));
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
