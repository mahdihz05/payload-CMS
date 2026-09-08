import { readFile } from "node:fs/promises";
import path from "node:path";
import config from "@payload-config";
import { getPayload } from "payload";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config });
  const authentication = await payload.auth({ headers: request.headers });
  if (!authentication.user) return NextResponse.json({ error: { code: "unauthorized", detail: "Administrator authentication is required." } }, { status: 401 });
  if (authentication.user.role !== "admin" && authentication.user.role !== "editor") return NextResponse.json({ error: { code: "forbidden", detail: "File access is not permitted." } }, { status: 403 });
  const { id } = await params;
  const numericID = Number(id);
  if (!Number.isSafeInteger(numericID)) return NextResponse.json({ error: { code: "not_found", detail: "File not found." } }, { status: 404 });
  try {
    const document = await payload.findByID({ collection: "submission-files", id: numericID, depth: 0, overrideAccess: true });
    if (!document.filename) throw new Error("missing");
    const root = path.resolve(process.cwd(), "private-media/form-submissions");
    const filename = path.basename(document.filename);
    const target = path.resolve(root, filename);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error("invalid");
    const bytes = await readFile(target);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": document.mimeType || "application/octet-stream",
        "content-length": String(bytes.byteLength),
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: { code: "not_found", detail: "File not found." } }, { status: 404 });
  }
}
