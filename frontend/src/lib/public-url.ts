import { isLocale } from "./locales";
import type { Locale } from "./types";

export type PathValidationError =
  | "contains-locale"
  | "contains-percent-encoding"
  | "contains-reserved-character"
  | "contains-whitespace-or-control"
  | "invalid-segment";

export type PathValidationResult =
  | { valid: true; normalizedPath: string }
  | { valid: false; normalizedPath: string; errors: PathValidationError[] };

export type PublicRouteValidationResult =
  | { valid: true; locale: Locale; normalizedPath: string }
  | { valid: false; errors: (PathValidationError | "invalid-locale" | "non-canonical-route")[] };

export type PublicContentIndexability = {
  isPublished: boolean;
  isActive: boolean;
  hasUniquePath: boolean;
  isRouteValid: boolean;
  isSelfCanonical: boolean;
  robotsIndex: boolean;
  isRedirectSource?: boolean;
  isDeleted?: boolean;
};

export type CanonicalOverrideValidationResult =
  | { valid: true; url: string }
  | { valid: false; error: "invalid-url" | "not-absolute-http-url" | "contains-credentials" | "contains-fragment" };

const VALID_SEGMENT = /^[\p{L}\p{M}\p{N}\p{Pc}\p{Pd}.~\u200c\u200d]+$/u;
const WHITESPACE_OR_CONTROL = /[\p{White_Space}\p{Cc}]/u;

/**
 * Paths are stored without a locale or surrounding slashes. Unicode is kept
 * readable and normalized to NFC; only ASCII A-Z is folded to lowercase.
 */
export function normalizePath(path: string): string {
  return path
    .normalize("NFC")
    .replace(/[A-Z]/g, (character) => character.toLowerCase())
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

export function validatePath(path: string): PathValidationResult {
  const normalizedPath = normalizePath(path);
  const errors = new Set<PathValidationError>();

  if (WHITESPACE_OR_CONTROL.test(normalizedPath)) errors.add("contains-whitespace-or-control");
  if (normalizedPath.includes("%")) errors.add("contains-percent-encoding");
  if (/[\\?#]/u.test(normalizedPath)) errors.add("contains-reserved-character");

  const segments = normalizedPath ? normalizedPath.split("/") : [];
  if (segments.length > 0 && isLocale(segments[0])) errors.add("contains-locale");
  if (segments.some((segment) => segment === "." || segment === ".." || !VALID_SEGMENT.test(segment))) {
    errors.add("invalid-segment");
  }

  return errors.size === 0
    ? { valid: true, normalizedPath }
    : { valid: false, normalizedPath, errors: [...errors] };
}

export function validateSlug(slug: string): PathValidationResult {
  const result = validatePath(slug);
  if (!result.valid) return result;
  if (!result.normalizedPath || result.normalizedPath.includes("/")) {
    return { valid: false, normalizedPath: result.normalizedPath, errors: ["invalid-segment"] };
  }
  return result;
}

export function buildLocalizedUrl(locale: Locale, path = ""): string {
  const result = validatePath(path);
  if (!isLocale(locale) || !result.valid) {
    throw new TypeError("Cannot build a public URL from an invalid locale or path");
  }
  return result.normalizedPath ? `/${locale}/${result.normalizedPath}` : `/${locale}`;
}

export function buildCanonicalSelfUrl(siteUrl: string, locale: Locale, path = ""): string {
  const origin = new URL(siteUrl);
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new TypeError("Canonical site URL must be an HTTP(S) origin");
  }

  return new URL(buildLocalizedUrl(locale, path), origin).href;
}

export function validateCanonicalOverride(value: string): CanonicalOverrideValidationResult {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { valid: false, error: "invalid-url" };
  }
  if (!["http:", "https:"].includes(url.protocol)) return { valid: false, error: "not-absolute-http-url" };
  if (url.username || url.password) return { valid: false, error: "contains-credentials" };
  if (url.hash) return { valid: false, error: "contains-fragment" };
  return { valid: true, url: url.href };
}

export function validatePublicRoute(pathname: string): PublicRouteValidationResult {
  if (!pathname.startsWith("/") || pathname.includes("?") || pathname.includes("#")) {
    return { valid: false, errors: ["non-canonical-route"] };
  }

  const [localeCandidate = "", ...pathSegments] = pathname.slice(1).split("/");
  if (!isLocale(localeCandidate)) return { valid: false, errors: ["invalid-locale"] };

  const path = pathSegments.join("/");
  const result = validatePath(path);
  if (!result.valid) return result;

  if (pathname !== buildLocalizedUrl(localeCandidate, result.normalizedPath)) {
    return { valid: false, errors: ["non-canonical-route"] };
  }

  return { valid: true, locale: localeCandidate, normalizedPath: result.normalizedPath };
}

export function isPublicContentIndexable(state: PublicContentIndexability): boolean {
  return (
    state.isPublished &&
    state.isActive &&
    state.hasUniquePath &&
    state.isRouteValid &&
    state.isSelfCanonical &&
    state.robotsIndex &&
    !state.isRedirectSource &&
    !state.isDeleted
  );
}
