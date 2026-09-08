import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";

const { loadEnvConfig } = createRequire(import.meta.url)("@next/env") as typeof import("@next/env");
loadEnvConfig(process.cwd());

const enabled = process.env.RUN_PAYLOAD_INTEGRATION === "1";
const baseURL = process.env.FORM_E2E_BASE_URL ?? "http://127.0.0.1:3000";
const key = `TEST-AUDIT-upload-${Date.now()}`;
let payload: Payload;
let formID: number;
let submissionID: number | undefined;

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFgAI/ScL9NwAAAABJRU5ErkJggg==", "base64");

describe.skipIf(!enabled)("form submission uploads", () => {
  beforeAll(async () => {
    const { default: config } = await import("../../../../../payload.config");
    payload = await getPayload({ config });
    const form = await payload.create({
      collection: "forms",
      overrideAccess: true,
      data: {
        key,
        title: "TEST-AUDIT upload",
        successMessage: "Saved",
        requiresPrivacyConsent: false,
        retentionMonths: 1,
        fields: [
          { key: "name", fieldType: "text", label: "Name", required: true },
          { key: "attachment", fieldType: "file", label: "Attachment", required: true },
        ],
      },
    });
    formID = form.id;
  });

  afterAll(async () => {
    if (!payload) return;
    if (submissionID) {
      const files = await payload.find({ collection: "submission-files", overrideAccess: true, depth: 0, where: { submission: { equals: submissionID } } });
      await Promise.all(files.docs.map((file) => payload.delete({ collection: "submission-files", id: file.id, overrideAccess: true })));
      await payload.delete({ collection: "form-submissions", id: submissionID, overrideAccess: true });
    }
    if (formID) await payload.delete({ collection: "forms", id: formID, overrideAccess: true });
  });

  it("stores a validated private file and rejects a missing required file", async () => {
    const missing = new FormData();
    missing.set("locale", "fa");
    missing.set("data", JSON.stringify({ name: "TEST-AUDIT" }));
    missing.set("consent_given", "false");
    const missingResponse = await fetch(`${baseURL}/api/forms/${key}/submissions`, { method: "POST", body: missing });
    expect(missingResponse.status).toBe(400);

    const body = new FormData();
    body.set("locale", "fa");
    body.set("data", JSON.stringify({ name: "TEST-AUDIT" }));
    body.set("consent_given", "false");
    body.set("attachment", new File([png], "TEST-AUDIT.png", { type: "image/png" }));
    const response = await fetch(`${baseURL}/api/forms/${key}/submissions`, { method: "POST", body });
    const result = await response.json() as { data?: { id: number }; error?: { detail: string } };
    expect(response.status, result.error?.detail).toBe(201);
    submissionID = result.data!.id;

    const files = await payload.find({ collection: "submission-files", overrideAccess: true, depth: 0, where: { submission: { equals: submissionID } } });
    expect(files.docs).toHaveLength(1);
    expect(files.docs[0]).toMatchObject({ originalName: "TEST-AUDIT.png", mimeType: "image/png", filesize: png.byteLength });
  });
});
