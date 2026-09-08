import { SITE_URL } from "@/lib/seo";
import type { SiteSettings } from "@/lib/types";
import { organizationSchemas, serializeJsonLd } from "@/lib/schema";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
export function OrganizationJsonLd({ settings }: { settings: SiteSettings }) {
  const schemas = organizationSchemas({ brandName: settings.brand_name, siteUrl: SITE_URL, logoUrl: settings.logo_url, phone: settings.phone, email: settings.email, address: settings.address });
  return <>{schemas.map((schema) => <JsonLd key={String(schema["@type"])} data={schema} />)}</>;
}
