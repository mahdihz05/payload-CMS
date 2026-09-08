import { afterEach, describe, expect, it, vi } from "vitest";
import { databaseURI, defaultLocale, ipHashSecret, localeConfig, locales, payloadSecret, siteURL } from "./site-config";

afterEach(() => vi.unstubAllEnvs());

describe("starter configuration", () => {
  it("keeps locale codes, direction, and default locale in one contract", () => {
    expect(locales).toEqual(localeConfig.map(({ code }) => code));
    expect(defaultLocale).toBe("en");
    expect(localeConfig.find(({ code }) => code === "fa")?.direction).toBe("rtl");
    expect(localeConfig.find(({ code }) => code === "en")?.direction).toBe("ltr");
  });

  it("uses localhost only outside production and requires a production origin", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteURL()).toBe("http://localhost:3000");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => siteURL()).toThrow("NEXT_PUBLIC_SITE_URL is required in production");
  });

  it("rejects missing or weak required runtime secrets", () => {
    vi.stubEnv("PAYLOAD_SECRET", "");
    expect(() => payloadSecret()).toThrow("PAYLOAD_SECRET is required");
    vi.stubEnv("PAYLOAD_SECRET", "short");
    vi.stubEnv("NODE_ENV", "production");
    expect(() => payloadSecret()).toThrow("at least 32 characters");
    vi.stubEnv("PAYLOAD_SECRET", "CHANGE_ME_USE_AT_LEAST_32_RANDOM_CHARACTERS");
    expect(() => payloadSecret()).toThrow("production placeholder");
    vi.stubEnv("DATABASE_URI", "");
    expect(() => databaseURI()).toThrow("DATABASE_URI is required");
    vi.stubEnv("IP_HASH_SECRET", "");
    expect(() => ipHashSecret()).toThrow("IP_HASH_SECRET is required in production");
  });
});
