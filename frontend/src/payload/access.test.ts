import { describe, expect, it } from "vitest";
import { adminOnly, contentFieldManager, contentManager, contentReader, formManager, seoFieldManager, seoManager } from "./access";

function request(role?: "admin" | "editor" | "seo" | "viewer") {
  return { req: { user: role ? { role } : undefined } } as never;
}

describe("role-based access", () => {
  it("limits administration to administrators", () => {
    expect(adminOnly(request("admin"))).toBe(true);
    expect(adminOnly(request("editor"))).toBe(false);
  });

  it("separates content, form, SEO, and read-only roles", () => {
    expect(contentManager(request("editor"))).toBe(true);
    expect(formManager(request("seo"))).toBe(false);
    expect(seoManager(request("seo"))).toBe(true);
    expect(seoFieldManager(request("seo"))).toBe(true);
    expect(contentFieldManager(request("seo"))).toBe(false);
    expect(contentReader(request("viewer"))).toBe(true);
  });
});
