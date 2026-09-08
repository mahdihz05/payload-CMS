import config from "@payload-config";
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from "@payloadcms/next/routes";
import { NextResponse } from "next/server";

const documentCollections = new Set(["content", "media", "forms", "form-submissions", "submission-files", "audit-logs", "seo-redirects"]);
type RouteContext = { params: Promise<{ slug?: string[] }> };

function invalidDocumentID(slug: string[] | undefined) {
  return Boolean(slug && slug.length === 2 && documentCollections.has(slug[0]) && !/^\d+$/.test(slug[1]));
}

function withDocumentIDValidation(handler: ReturnType<typeof REST_GET>) {
  return async (request: Request, context: RouteContext) => {
    const { slug } = await context.params;
    if (invalidDocumentID(slug)) return NextResponse.json({ error: { code: "not_found", detail: "Document not found." } }, { status: 404 });
    return handler(request, context);
  };
}

export const GET = withDocumentIDValidation(REST_GET(config));
export const POST = REST_POST(config);
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const PUT = REST_PUT(config);
export const OPTIONS = REST_OPTIONS(config);
