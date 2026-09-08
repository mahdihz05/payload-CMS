import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const MAX_CLOCK_SKEW_SECONDS = 300;

function equalSignature(expected: string, supplied: string) {
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(supplied, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) return NextResponse.json({ error: "Revalidation is not configured." }, { status: 503 });
  const timestamp = request.headers.get("x-payload-timestamp") ?? "";
  const supplied = request.headers.get("x-payload-signature") ?? "";
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > MAX_CLOCK_SKEW_SECONDS) {
    return NextResponse.json({ error: "Expired signature." }, { status: 401 });
  }
  const rawBody = await request.text();
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  if (!/^[0-9a-f]{64}$/i.test(supplied) || !equalSignature(expected, supplied)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }
  let payload: { tags?: unknown; paths?: unknown };
  try {
    payload = JSON.parse(rawBody) as { tags?: unknown; paths?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const tags = Array.isArray(payload.tags) ? payload.tags.filter((item): item is string => typeof item === "string" && item.length <= 256).slice(0, 50) : [];
  const paths = Array.isArray(payload.paths) ? payload.paths.filter((item): item is string => typeof item === "string" && item.startsWith("/") && item.length <= 1024).slice(0, 50) : [];
  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);
  return NextResponse.json({ revalidated: true, tags: tags.length, paths: paths.length });
}
