import { createHash } from "node:crypto";
import type { Form } from "@/payload-types";
import type { Locale } from "./site-config";
import { ipHashSecret } from "./site-config";

const PHONE_PATTERN = /^[+0-9][0-9()\-\s]{6,24}$/;

export type SubmissionInput = {
  locale: Locale;
  data: Record<string, unknown>;
  consent_given: boolean;
  source_url?: string;
  referrer?: string;
  website?: string;
};

export function hashIPAddress(address: string) {
  const secret = ipHashSecret();
  return createHash("sha256").update(`${secret}:${address}`).digest("hex");
}

export function validateSubmission(form: Form, input: SubmissionInput, uploadedFileKeys = new Set<string>()) {
  if (!form.isActive) throw new Error("inactive");
  if (input.website?.trim()) throw new Error("honeypot");
  if (form.requiresPrivacyConsent && !input.consent_given) throw new Error("consent");
  const configuredFields = (form.fields ?? []).filter((field) => field.enabled !== false);
  const knownKeys = new Set(configuredFields.map((field) => field.key));
  const unknown = Object.keys(input.data).filter((key) => !knownKeys.has(key));
  if (unknown.length) throw new Error(`unknown:${unknown.sort().join(",")}`);

  const cleaned: Record<string, boolean | string | string[]> = {};
  for (const field of configuredFields) {
    if (field.fieldType === "file") {
      if (field.required && !uploadedFileKeys.has(field.key)) throw new Error(`required:${field.key}`);
      continue;
    }
    const value = input.data[field.key];
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      if (field.required) throw new Error(`required:${field.key}`);
      continue;
    }
    if (field.fieldType === "multi-select") {
      const options = Array.isArray(field.options) ? field.options.map(String) : [];
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !options.includes(item))) throw new Error(`invalid:${field.key}`);
      cleaned[field.key] = value;
      continue;
    }
    if (field.fieldType === "checkbox") {
      if (typeof value !== "boolean") throw new Error(`invalid:${field.key}`);
      cleaned[field.key] = value;
      continue;
    }
    const text = String(value).trim();
    if (field.minLength !== null && field.minLength !== undefined && text.length < field.minLength) throw new Error(`min_length:${field.key}`);
    if (field.maxLength !== null && field.maxLength !== undefined && text.length > field.maxLength) throw new Error(`max_length:${field.key}`);
    if (field.pattern && !new RegExp(field.pattern).test(text)) throw new Error(`invalid:${field.key}`);
    if (field.fieldType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new Error(`invalid:${field.key}`);
    if (field.fieldType === "phone" && !PHONE_PATTERN.test(text)) throw new Error(`invalid:${field.key}`);
    if (field.fieldType === "url") {
      try { new URL(text); } catch { throw new Error(`invalid:${field.key}`); }
    }
    if (field.fieldType === "number") {
      const number = Number(text);
      if (!Number.isFinite(number)) throw new Error(`invalid:${field.key}`);
      if (field.minValue !== null && field.minValue !== undefined && number < field.minValue) throw new Error(`min_value:${field.key}`);
      if (field.maxValue !== null && field.maxValue !== undefined && number > field.maxValue) throw new Error(`max_value:${field.key}`);
      cleaned[field.key] = String(number);
      continue;
    }
    if (["select", "radio"].includes(field.fieldType)) {
      const options = Array.isArray(field.options) ? field.options.map(String) : [];
      if (!options.includes(text)) throw new Error(`invalid:${field.key}`);
    }
    cleaned[field.key] = text;
  }
  return cleaned;
}
