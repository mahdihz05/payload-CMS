import { describe, expect, it } from "vitest";
import { validateRedirectRule, type RedirectRule } from "./redirect-policy";

const base: RedirectRule = {
  id: 1,
  sourceLocale: "en",
  sourcePath: "old",
  destination: { type: "content", locale: "en", path: "new" },
  status: "308",
  enabled: true,
};

describe("validateRedirectRule", () => {
  it("accepts permanent, temporary, disabled, and external redirects", () => {
    expect(validateRedirectRule(base, [])).toEqual([]);
    expect(validateRedirectRule({ ...base, status: "307" }, [])).toEqual([]);
    expect(validateRedirectRule({ ...base, enabled: false }, [])).toEqual([]);
    expect(validateRedirectRule({ ...base, destination: { type: "url", url: "https://example.com/new" } }, [])).toEqual([]);
  });

  it("rejects invalid sources and destinations", () => {
    expect(validateRedirectRule({ ...base, sourcePath: "/old/" }, [])).toContain("invalid-source");
    expect(validateRedirectRule({ ...base, destination: { type: "url", url: "/relative" } }, [])).toContain("invalid-destination");
  });

  it("rejects duplicate sources and self redirects", () => {
    expect(validateRedirectRule({ ...base, id: 2 }, [base])).toContain("duplicate-source");
    expect(validateRedirectRule({ ...base, destination: { type: "content", locale: "en", path: "old" } }, [])).toContain("self-redirect");
  });

  it("rejects chains and loops", () => {
    const next: RedirectRule = {
      ...base,
      id: 2,
      sourcePath: "new",
      destination: { type: "content", locale: "en", path: "final" },
    };
    expect(validateRedirectRule(base, [next])).toContain("redirect-chain");
    const loop = { ...next, destination: { type: "content" as const, locale: "en" as const, path: "old" } };
    expect(validateRedirectRule(base, [loop])).toEqual(expect.arrayContaining(["redirect-chain", "redirect-loop"]));
  });
});
