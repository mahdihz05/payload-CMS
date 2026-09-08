import type { Locale } from "./types";
import { normalizePath, validateCanonicalOverride, validatePath } from "./public-url";

export type RedirectStatus = "307" | "308";
export type RedirectDestination =
  | { type: "content"; locale: Locale; path: string }
  | { type: "url"; url: string };

export type RedirectRule = {
  id?: number | string;
  sourceLocale: Locale;
  sourcePath: string;
  destination: RedirectDestination;
  status: RedirectStatus;
  enabled: boolean;
};

export type RedirectValidationError =
  | "invalid-source"
  | "invalid-destination"
  | "duplicate-source"
  | "self-redirect"
  | "redirect-chain"
  | "redirect-loop";

export function redirectKey(locale: Locale, path: string): string {
  return `${locale}:${normalizePath(path)}`;
}

export function validateRedirectRule(candidate: RedirectRule, existing: RedirectRule[]): RedirectValidationError[] {
  const errors = new Set<RedirectValidationError>();
  const sourceValidation = validatePath(candidate.sourcePath);
  if (!sourceValidation.valid || sourceValidation.normalizedPath !== candidate.sourcePath) errors.add("invalid-source");

  const sourceKey = redirectKey(candidate.sourceLocale, candidate.sourcePath);
  const otherRules = existing.filter((rule) => rule.id !== candidate.id);
  const otherEnabled = otherRules.filter((rule) => rule.enabled);
  if (otherRules.some((rule) => redirectKey(rule.sourceLocale, rule.sourcePath) === sourceKey)) errors.add("duplicate-source");

  if (candidate.destination.type === "url") {
    if (!validateCanonicalOverride(candidate.destination.url).valid) errors.add("invalid-destination");
    return [...errors];
  }

  const destinationValidation = validatePath(candidate.destination.path);
  if (!destinationValidation.valid || destinationValidation.normalizedPath !== candidate.destination.path) {
    errors.add("invalid-destination");
    return [...errors];
  }

  const destinationKey = redirectKey(candidate.destination.locale, candidate.destination.path);
  if (sourceKey === destinationKey) errors.add("self-redirect");

  const destinationRule = otherEnabled.find((rule) => redirectKey(rule.sourceLocale, rule.sourcePath) === destinationKey);
  if (destinationRule) {
    errors.add("redirect-chain");
    if (
      destinationRule.destination.type === "content" &&
      redirectKey(destinationRule.destination.locale, destinationRule.destination.path) === sourceKey
    ) {
      errors.add("redirect-loop");
    }
  }

  return [...errors];
}
