import { describe, expect, it } from "vitest";
import { buildSeoMigrationInventory, type SeoInventoryInput } from "./seo-migration-inventory";

const base: SeoInventoryInput = {
  id: 1,
  key: "about",
  locale: "en",
  templateKey: "default",
  slug: "about",
  path: "about",
  seoTitle: null,
  seoDescription: null,
  canonicalOverride: null,
  robotsIndex: true,
  robotsFollow: true,
  status: "published",
  isActive: true,
};

describe("buildSeoMigrationInventory", () => {
  it("detects exact and normalization collisions without mutating input", () => {
    const inputs = [base, { ...base, id: 2, key: "other", path: "/ABOUT/", slug: "other" }];
    const snapshot = structuredClone(inputs);
    const report = buildSeoMigrationInventory(inputs, "https://example.com");

    expect(report.summary.normalizedCollisions).toBe(2);
    expect(report.summary.duplicateCurrentPaths).toBe(0);
    expect(report.summary.redirectsRequired).toBe(1);
    expect(inputs).toEqual(snapshot);
  });

  it("detects duplicate current paths and slugs within a locale only", () => {
    const report = buildSeoMigrationInventory([
      base,
      { ...base, id: 2, key: "two" },
      { ...base, id: 3, key: "fa-about", locale: "fa" },
    ], "https://example.com");

    expect(report.summary.duplicateCurrentPaths).toBe(2);
    expect(report.summary.duplicateCurrentSlugs).toBe(2);
  });

  it("reports invalid paths, unsupported nested routes, and malformed canonical overrides", () => {
    const report = buildSeoMigrationInventory([
      { ...base, path: "bad path", canonicalOverride: "/relative" },
      { ...base, id: 2, key: "article", slug: "article", path: "news/2026/article", canonicalOverride: null },
    ], "https://example.com");

    expect(report.records[0].validationErrors).toContain("path:contains-whitespace-or-control");
    expect(report.records[0].suspiciousCanonicalOverride).toBe("invalid-url");
    expect(report.records[1].unsupportedRouteCondition).toBe("no-matching-current-route");
  });

  it("constructs future localized self canonicals and flags non-self overrides", () => {
    const report = buildSeoMigrationInventory([
      { ...base, locale: "fa", path: "راهکارها", canonicalOverride: "https://external.example/fa/راهکارها" },
    ], "https://example.com");

    expect(report.records[0].futureCanonicalUrl).toContain("https://example.com/fa/");
    expect(report.records[0].suspiciousCanonicalOverride).toBe("external-canonical");
  });

  it("does not invent a home canonical for a missing non-home localized path", () => {
    const report = buildSeoMigrationInventory([{ ...base, slug: null, path: null }], "https://example.com");

    expect(report.records[0].futureCanonicalUrl).toBeNull();
    expect(report.records[0].unsupportedRouteCondition).toBe("invalid-public-path");
  });
});
