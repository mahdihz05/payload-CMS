import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isLocale } from "@/lib/locales";
import { normalizePath } from "@/lib/public-url";
import { findPublicRedirect } from "@/lib/redirect-service";

export async function proxy(request: NextRequest) {
  const [localeCandidate = "", ...segments] = request.nextUrl.pathname.slice(1).split("/");
  if (!isLocale(localeCandidate)) return NextResponse.next();

  const redirect = await findPublicRedirect(localeCandidate, normalizePath(segments.join("/")));
  if (!redirect) return NextResponse.next();
  return NextResponse.redirect(new URL(redirect.destination, request.url), redirect.status);
}

export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|robots.txt|sitemap.xml|.*\\..*).*)"],
};
