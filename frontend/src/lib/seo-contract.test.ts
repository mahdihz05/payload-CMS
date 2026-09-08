import { describe, expect, it } from "vitest";
import { contentTypeFor } from "./seo-contract";

describe("contentTypeFor", () => {
  it("maps current content ownership without introducing a pages collection", () => {
    expect(contentTypeFor({ kind: "page", templateKey: "home" })).toBe("page");
    expect(contentTypeFor({ kind: "service", templateKey: "service" })).toBe("service");
    expect(contentTypeFor({ kind: "solution", templateKey: "solution" })).toBe("solution");
    expect(contentTypeFor({ kind: "service", templateKey: "independent-service" })).toBe("independent-service");
    expect(contentTypeFor({ kind: "news", templateKey: "news" })).toBe("editorial");
    expect(contentTypeFor({ kind: "knowledge", templateKey: "knowledge" })).toBe("editorial");
  });
});
