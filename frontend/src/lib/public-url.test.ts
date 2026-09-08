import { describe, expect, it } from "vitest";
import {
  buildCanonicalSelfUrl,
  buildLocalizedUrl,
  isPublicContentIndexable,
  normalizePath,
  validateCanonicalOverride,
  validatePath,
  validatePublicRoute,
  validateSlug,
} from "./public-url";

describe("normalizePath", () => {
  it("represents an empty or slash-only path as home", () => {
    expect(normalizePath("")).toBe("");
    expect(normalizePath("///")).toBe("");
  });

  it("removes surrounding and duplicate slashes", () => {
    expect(normalizePath("//Services///Cloud//")).toBe("services/cloud");
  });

  it("normalizes Unicode to NFC while preserving Persian and Arabic casing", () => {
    expect(normalizePath("/راهکارهای/ابر/")).toBe("راهکارهای/ابر");
    expect(normalizePath("/الخدمات/السحابية/")).toBe("الخدمات/السحابية");
    expect(normalizePath("cafe\u0301")).toBe("café");
  });
});

describe("validatePath", () => {
  it("accepts home, nested, Persian, Arabic, and normalized English paths", () => {
    expect(validatePath("")).toEqual({ valid: true, normalizedPath: "" });
    expect(validatePath("/Services//Managed-IT/")).toEqual({ valid: true, normalizedPath: "services/managed-it" });
    expect(validatePath("راهکارهای/ابر").valid).toBe(true);
    expect(validatePath("الخدمات/السحابية").valid).toBe(true);
  });

  it.each(["services/cloud?plan=1", "services\\cloud", "services/cloud plan", "services/%2F/cloud", "services/../cloud"])(
    "rejects invalid path %s",
    (path) => expect(validatePath(path).valid).toBe(false),
  );

  it("rejects a locale stored in the content path", () => {
    expect(validatePath("fa/services")).toMatchObject({ valid: false, errors: ["contains-locale"] });
  });

  it("requires a slug to be exactly one non-empty segment", () => {
    expect(validateSlug("Managed-IT")).toEqual({ valid: true, normalizedPath: "managed-it" });
    expect(validateSlug("").valid).toBe(false);
    expect(validateSlug("services/cloud").valid).toBe(false);
  });
});

describe("localized public URLs", () => {
  it("builds home and nested paths for every supported locale", () => {
    expect(buildLocalizedUrl("fa")).toBe("/fa");
    expect(buildLocalizedUrl("en", "Services//Cloud/")).toBe("/en/services/cloud");
    expect(buildLocalizedUrl("ar-ae", "الخدمات/السحابية")).toBe("/ar-ae/الخدمات/السحابية");
  });

  it("validates absolute HTTP canonical overrides", () => {
    expect(validateCanonicalOverride("https://example.com/fa/page")).toEqual({
      valid: true,
      url: "https://example.com/fa/page",
    });
    expect(validateCanonicalOverride("/fa/page").valid).toBe(false);
    expect(validateCanonicalOverride("javascript:alert(1)").valid).toBe(false);
    expect(validateCanonicalOverride("https://user:secret@example.com/page").valid).toBe(false);
    expect(validateCanonicalOverride("https://example.com/page#section").valid).toBe(false);
  });

  it("builds an absolute self canonical from an origin", () => {
    expect(buildCanonicalSelfUrl("https://example.com", "fa", "راهکارهای/ابر")).toBe(
      "https://example.com/fa/%D8%B1%D8%A7%D9%87%DA%A9%D8%A7%D8%B1%D9%87%D8%A7%DB%8C/%D8%A7%D8%A8%D8%B1",
    );
  });

  it("rejects unsupported locales and non-origin canonical bases", () => {
    expect(() => buildLocalizedUrl("de" as "fa", "services")).toThrow(TypeError);
    expect(() => buildCanonicalSelfUrl("https://example.com/base", "en", "services")).toThrow(TypeError);
  });
});

describe("validatePublicRoute", () => {
  it("accepts canonical home and nested localized routes", () => {
    expect(validatePublicRoute("/fa")).toEqual({ valid: true, locale: "fa", normalizedPath: "" });
    expect(validatePublicRoute("/ar-ae/الخدمات/السحابية")).toEqual({
      valid: true,
      locale: "ar-ae",
      normalizedPath: "الخدمات/السحابية",
    });
  });

  it.each(["/de/services", "/FA/services", "/en/services/", "/en//services", "en/services", "/en/services?q=x"])(
    "rejects invalid or non-canonical route %s",
    (route) => expect(validatePublicRoute(route).valid).toBe(false),
  );
});

describe("isPublicContentIndexable", () => {
  const indexable = {
    isPublished: true,
    isActive: true,
    hasUniquePath: true,
    isRouteValid: true,
    isSelfCanonical: true,
    robotsIndex: true,
  };

  it("requires every public URL and indexing invariant", () => {
    expect(isPublicContentIndexable(indexable)).toBe(true);
    expect(isPublicContentIndexable({ ...indexable, isPublished: false })).toBe(false);
    expect(isPublicContentIndexable({ ...indexable, robotsIndex: false })).toBe(false);
    expect(isPublicContentIndexable({ ...indexable, isRedirectSource: true })).toBe(false);
  });
});
