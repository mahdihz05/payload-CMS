import type { Locale } from "@/lib/types";
import { schemasForResolvedSeo } from "@/lib/schema";
import { resolvedSeoForPath } from "@/lib/seo";
import { JsonLd } from "./structured-data";

export async function ContentStructuredData({ locale, path }: { locale: Locale; path: string }) {
  const seo = await resolvedSeoForPath(locale, path);
  if (!seo) return null;
  const schemas = schemasForResolvedSeo(seo, seo.site.brandName, seo.site.origin);
  return <>{schemas.map((schema, index) => <JsonLd key={`${String(schema["@type"])}-${index}`} data={schema} />)}</>;
}
