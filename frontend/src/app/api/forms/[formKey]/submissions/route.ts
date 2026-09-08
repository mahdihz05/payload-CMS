import config from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hashIPAddress, validateSubmission } from "@/lib/forms";
import { localeCodes } from "@/lib/site-config";

const requestSchema = z.object({
  locale: z.enum(localeCodes),
  data: z.record(z.string(), z.unknown()),
  consent_given: z.boolean(),
  source_url: z.string().url().max(500).optional().or(z.literal("")),
  referrer: z.string().url().max(500).optional().or(z.literal("")),
  website: z.string().max(500).optional(),
});

const multipartSchema = requestSchema.extend({
  data: z.string().transform((value, ctx) => {
    try { return JSON.parse(value) as Record<string, unknown>; } catch { ctx.addIssue({ code: "custom", message: "Invalid form data." }); return z.NEVER; }
  }),
  consent_given: z.enum(["true", "false"]).transform((value) => value === "true"),
});

function clientIP(request: Request) {
  return (request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "").trim();
}

export async function POST(request: Request, { params }: { params: Promise<{ formKey: string }> }) {
  if (Number(request.headers.get("content-length") ?? 0) > 11 * 1024 * 1024) return NextResponse.json({ error: { code: "request_too_large", detail: "Request too large." } }, { status: 413 });
  const multipart = request.headers.get("content-type")?.includes("multipart/form-data");
  const raw = multipart ? await request.formData().catch(() => null) : await request.json().catch(() => null);
  const parsed = multipart && raw instanceof FormData
    ? multipartSchema.safeParse(Object.fromEntries([...raw.entries()].filter(([, value]) => typeof value === "string")))
    : requestSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: { code: "invalid_request", detail: parsed.error.flatten() } }, { status: 400 });
  const { formKey } = await params;
  const payload = await getPayload({ config });
  const forms = await payload.find({ collection: "forms", locale: parsed.data.locale, fallbackLocale: false, limit: 1, overrideAccess: true, where: { key: { equals: formKey } } });
  const form = forms.docs[0];
  if (!form?.isActive) return NextResponse.json({ error: { code: "not_found", detail: "This form is not available." } }, { status: 404 });

  const address = clientIP(request);
  const ipHash = address ? hashIPAddress(address) : "";
  if (ipHash) {
    const recent = await payload.count({ collection: "form-submissions", overrideAccess: true, where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: new Date(Date.now() - 3_600_000).toISOString() } }] } });
    if (recent.totalDocs >= 10) return NextResponse.json({ error: { code: "throttled", detail: "Too many submissions." } }, { status: 429 });
  }

  try {
    const files = multipart && raw instanceof FormData
      ? (form.fields ?? []).flatMap((field) => {
        if (field.fieldType !== "file") return [];
        const value = raw.get(field.key);
        return value instanceof File && value.size > 0 ? [{ key: field.key, value }] : [];
      })
      : [];
    const cleaned = validateSubmission(form, parsed.data, new Set(files.map((file) => file.key)));
    const submission = await payload.create({
      collection: "form-submissions", overrideAccess: true,
      data: {
        form: form.id, locale: parsed.data.locale, data: cleaned, status: "new",
        sourceURL: parsed.data.source_url ?? "", referrer: parsed.data.referrer ?? "",
        consentGiven: parsed.data.consent_given, consentText: form.consentLabel ?? "",
        userAgent: (request.headers.get("user-agent") ?? "").slice(0, 500), ipHash,
        expiresAt: new Date(Date.now() + form.retentionMonths * 30 * 86_400_000).toISOString(),
      },
    });
    const createdFiles: number[] = [];
    try {
      for (const { value } of files) {
        const bytes = Buffer.from(await value.arrayBuffer());
        const uploaded = await payload.create({
          collection: "submission-files",
          overrideAccess: true,
          draft: false,
          data: { submission: submission.id, originalName: value.name, checksumSHA256: "pending-validation" },
          file: { data: bytes, mimetype: value.type || "application/octet-stream", name: value.name, size: bytes.byteLength },
        });
        createdFiles.push(uploaded.id);
      }
    } catch (error) {
      await Promise.all(createdFiles.map((id) => payload.delete({ collection: "submission-files", id, overrideAccess: true })));
      await payload.delete({ collection: "form-submissions", id: submission.id, overrideAccess: true });
      throw error;
    }
    return NextResponse.json({ data: { id: submission.id, message: form.successMessage } }, { status: 201 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "invalid";
    const status = detail === "honeypot" ? 400 : detail === "inactive" ? 404 : 400;
    return NextResponse.json({ error: { code: "validation_error", detail } }, { status });
  }
}
