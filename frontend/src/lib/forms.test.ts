import { describe, expect, it, vi } from "vitest";
import type { Form } from "@/payload-types";
import { hashIPAddress, validateSubmission } from "./forms";

const form = {
  id: 1,
  key: "consultation",
  isActive: true,
  requiresPrivacyConsent: true,
  retentionMonths: 12,
  title: "Consultation",
  successMessage: "Saved",
  fields: [
    { id: "name", key: "full_name", fieldType: "text", required: true, label: "Name", enabled: true },
    { id: "phone", key: "phone", fieldType: "phone", required: true, label: "Phone", enabled: true },
    { id: "need", key: "need_type", fieldType: "select", required: true, options: ["assessment", "security"], label: "Need", enabled: true },
  ],
  updatedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
} as Form;

const valid = {
  locale: "fa" as const,
  data: { full_name: "علی رضایی", phone: "09123456789", need_type: "assessment" },
  consent_given: true,
};

describe("generic form submission validation", () => {
  it("cleans an allowed submission", () => {
    expect(validateSubmission(form, valid)).toEqual(valid.data);
  });

  it("rejects missing consent, unknown fields, and honeypot content", () => {
    expect(() => validateSubmission(form, { ...valid, consent_given: false })).toThrow("consent");
    expect(() => validateSubmission(form, { ...valid, data: { ...valid.data, is_admin: true } })).toThrow("unknown:is_admin");
    expect(() => validateSubmission(form, { ...valid, website: "spam" })).toThrow("honeypot");
  });

  it("requires configured file fields while allowing optional files", () => {
    const withFile = { ...form, fields: [...form.fields ?? [], { id: "attachment", key: "attachment", fieldType: "file", required: true, label: "Attachment", enabled: true }] } as Form;
    expect(() => validateSubmission(withFile, valid)).toThrow("required:attachment");
    expect(validateSubmission(withFile, valid, new Set(["attachment"]))).toEqual(valid.data);
  });

  it("creates stable non-reversible IP identifiers", () => {
    vi.stubEnv("IP_HASH_SECRET", "test-only-ip-hash-secret-at-least-32-characters");
    expect(hashIPAddress("127.0.0.1")).toBe(hashIPAddress("127.0.0.1"));
    expect(hashIPAddress("127.0.0.1")).not.toContain("127.0.0.1");
    vi.unstubAllEnvs();
  });
});
