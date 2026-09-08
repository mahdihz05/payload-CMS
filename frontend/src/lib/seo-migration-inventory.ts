import type { Locale } from "./types";
import {
  buildCanonicalSelfUrl,
  normalizePath,
  validateCanonicalOverride,
  validatePath,
  validateSlug,
} from "./public-url";

export type SeoInventoryInput = {
  id: number | string;
  key: string;
  locale: Locale;
  templateKey: string;
  slug: string | null;
  path: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalOverride: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  status: "draft" | "published";
  isActive: boolean;
};

export type SeoInventoryRecord = SeoInventoryInput & {
  normalizedPath: string;
  futureCanonicalUrl: string | null;
  validationErrors: string[];
  normalizedCollision: boolean;
  duplicateCurrentPath: boolean;
  duplicateCurrentSlug: boolean;
  redirectRequired: boolean;
  suspiciousCanonicalOverride: string | null;
  unsupportedRouteCondition: string | null;
};

export type SeoInventoryReport = {
  siteUrl: string;
  records: SeoInventoryRecord[];
  summary: {
    records: number;
    invalidPaths: number;
    normalizedCollisions: number;
    duplicateCurrentPaths: number;
    duplicateCurrentSlugs: number;
    redirectsRequired: number;
    suspiciousCanonicalOverrides: number;
    unsupportedRoutes: number;
  };
};

function duplicateKeys(inputs: SeoInventoryInput[], value: (input: SeoInventoryInput) => string) {
  const counts = new Map<string, number>();
  for (const input of inputs) {
    const item = value(input);
    if (!item) continue;
    const key = `${input.locale}\0${item}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([key]) => key));
}

function unsupportedCurrentRoute(path: string): string | null {
  if (!path) return null;
  const segments = path.split("/");
  if (segments.length === 1) return null;
  if (segments.length === 2 && ["services", "solutions", "independent-services"].includes(segments[0])) return null;
  return "no-matching-current-route";
}

export function buildSeoMigrationInventory(inputs: SeoInventoryInput[], siteUrl: string): SeoInventoryReport {
  const currentPaths = duplicateKeys(inputs, (input) => input.path ?? "");
  const currentSlugs = duplicateKeys(inputs, (input) => input.slug ?? "");
  const normalizedPaths = duplicateKeys(inputs, (input) => normalizePath(input.path ?? ""));

  const records = inputs.map<SeoInventoryRecord>((input) => {
    const pathValidation = validatePath(input.path ?? "");
    const slugValidation = validateSlug(input.slug ?? "");
    const normalizedPath = pathValidation.normalizedPath;
    const validationErrors = [
      ...(!pathValidation.valid ? pathValidation.errors.map((error) => `path:${error}`) : []),
      ...(!slugValidation.valid ? slugValidation.errors.map((error) => `slug:${error}`) : []),
      ...(input.slug === null ? ["slug:missing-localized-value"] : []),
      ...(input.path === null ? ["path:missing-localized-value"] : []),
      ...(!normalizedPath && input.templateKey !== "home" && input.key !== "home" ? ["path:non-home-empty"] : []),
    ];
    const canonical = input.canonicalOverride?.trim() || null;
    const canonicalValidation = canonical ? validateCanonicalOverride(canonical) : null;
    const futureCanonicalUrl = validationErrors.length === 0
      ? buildCanonicalSelfUrl(siteUrl, input.locale, normalizedPath)
      : null;
    const suspiciousCanonicalOverride = !canonical
      ? null
      : !canonicalValidation?.valid
        ? canonicalValidation?.error ?? "invalid-url"
        : canonicalValidation.url !== futureCanonicalUrl
          ? futureCanonicalUrl && new URL(canonicalValidation.url).origin === new URL(futureCanonicalUrl).origin
            ? "non-self-internal-canonical"
            : "external-canonical"
          : null;

    return {
      ...input,
      normalizedPath,
      futureCanonicalUrl,
      validationErrors,
      normalizedCollision: normalizedPaths.has(`${input.locale}\0${normalizedPath}`),
      duplicateCurrentPath: Boolean(input.path) && currentPaths.has(`${input.locale}\0${input.path}`),
      duplicateCurrentSlug: Boolean(input.slug) && currentSlugs.has(`${input.locale}\0${input.slug}`),
      redirectRequired: input.path !== null && input.path !== normalizedPath,
      suspiciousCanonicalOverride,
      unsupportedRouteCondition: validationErrors.some((error) => error.startsWith("path:"))
        ? "invalid-public-path"
        : unsupportedCurrentRoute(normalizedPath),
    };
  });

  return {
    siteUrl: new URL(siteUrl).origin,
    records,
    summary: {
      records: records.length,
      invalidPaths: records.filter((record) => record.validationErrors.length > 0).length,
      normalizedCollisions: records.filter((record) => record.normalizedCollision).length,
      duplicateCurrentPaths: records.filter((record) => record.duplicateCurrentPath).length,
      duplicateCurrentSlugs: records.filter((record) => record.duplicateCurrentSlug).length,
      redirectsRequired: records.filter((record) => record.redirectRequired).length,
      suspiciousCanonicalOverrides: records.filter((record) => record.suspiciousCanonicalOverride).length,
      unsupportedRoutes: records.filter((record) => record.unsupportedRouteCondition).length,
    },
  };
}

export function seoInventoryMarkdown(report: SeoInventoryReport): string {
  const problemRecords = report.records.filter((record) =>
    record.validationErrors.length || record.normalizedCollision || record.duplicateCurrentPath ||
    record.duplicateCurrentSlug || record.redirectRequired || record.suspiciousCanonicalOverride || record.unsupportedRouteCondition,
  );
  const lines = [
    "# SEO Migration Inventory Summary",
    "",
    `Site origin: \`${report.siteUrl}\``,
    "",
    "| Metric | Count |",
    "|---|---:|",
    ...Object.entries(report.summary).map(([key, value]) => `| ${key} | ${value} |`),
    "",
    "## Remediation Candidates",
    "",
  ];
  if (!problemRecords.length) lines.push("No path, collision, canonical, or current-route remediation candidates found.");
  for (const record of problemRecords) {
    const reasons = [
      ...record.validationErrors,
      record.normalizedCollision ? "normalized-collision" : null,
      record.duplicateCurrentPath ? "duplicate-current-path" : null,
      record.duplicateCurrentSlug ? "duplicate-current-slug" : null,
      record.redirectRequired ? "redirect-required" : null,
      record.suspiciousCanonicalOverride,
      record.unsupportedRouteCondition,
    ].filter(Boolean).join(", ");
    lines.push(`- \`${record.locale}:${record.key}\` \`${record.path ?? "<missing>"}\` -> \`${record.normalizedPath}\`: ${reasons}`);
  }
  lines.push(
    "",
    "## Future Uniqueness Migration",
    "",
    "Apply a locale-aware unique database constraint only after every validation error and normalized collision is resolved. Do not rewrite paths silently; create redirects for approved published URL changes before enabling the constraint.",
    "",
  );
  return lines.join("\n");
}
