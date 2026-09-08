import { describe, expect, it } from "vitest";
import { robotsPolicy } from "./robots-policy";

describe("robotsPolicy", () => {
  it("allows production public pages while protecting admin and API", () => {
    expect(robotsPolicy("https://example.com", true)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
      sitemap: "https://example.com/sitemap.xml",
      host: "https://example.com",
    });
  });

  it("blocks all crawling outside production", () => {
    expect(robotsPolicy("https://staging.example.com", false)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});
