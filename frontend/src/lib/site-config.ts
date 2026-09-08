export const localeCodes = ["en", "fa", "ar-ae"] as const;

export const localeConfig = [
  { code: "en", languageTag: "en", direction: "ltr", label: "English", shortLabel: "EN" },
  { code: "fa", languageTag: "fa", direction: "rtl", label: "فارسی", shortLabel: "فا" },
  { code: "ar-ae", languageTag: "ar-AE", direction: "rtl", label: "العربية", shortLabel: "ع" },
] as const;

export type Locale = (typeof localeCodes)[number];

export const defaultLocale: Locale = "en";
export const locales: Locale[] = [...localeCodes];

export function siteURL() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value && process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  const parsed = new URL(value || "http://localhost:3000");
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  return parsed.origin;
}

export function payloadSecret() {
  const value = process.env.PAYLOAD_SECRET;
  if (!value) throw new Error("PAYLOAD_SECRET is required.");
  if (process.env.NODE_ENV === "production" && value.startsWith("CHANGE_ME")) throw new Error("PAYLOAD_SECRET still contains a production placeholder.");
  if (process.env.NODE_ENV === "production" && value.length < 32) throw new Error("PAYLOAD_SECRET must contain at least 32 characters in production.");
  return value;
}

export function databaseURI() {
  const value = process.env.DATABASE_URI;
  if (!value) throw new Error("DATABASE_URI is required.");
  if (process.env.NODE_ENV === "production" && value.includes("CHANGE_ME")) throw new Error("DATABASE_URI still contains a production placeholder.");
  return value;
}

export function ipHashSecret() {
  const value = process.env.IP_HASH_SECRET || (process.env.NODE_ENV !== "production" ? process.env.PAYLOAD_SECRET : undefined);
  if (!value) throw new Error("IP_HASH_SECRET is required in production.");
  if (process.env.NODE_ENV === "production" && value.startsWith("CHANGE_ME")) throw new Error("IP_HASH_SECRET still contains a production placeholder.");
  if (process.env.NODE_ENV === "production" && value.length < 32) throw new Error("IP_HASH_SECRET must contain at least 32 characters in production.");
  return value;
}
