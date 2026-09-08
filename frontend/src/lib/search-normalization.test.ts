import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./search-normalization";

describe("normalizeSearchText", () => {
  it("normalizes Arabic letter variants, digits, diacritics, and ZWNJ", () => {
    expect(normalizeSearchText(" يَك\u200cشبكه ١٢۳ ")).toBe("یک شبکه 123");
  });

  it("collapses whitespace and lowercases Latin text", () => {
    expect(normalizeSearchText("  Example\n   Service  ")).toBe("example service");
  });
});
