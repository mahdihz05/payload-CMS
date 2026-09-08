import Link from "next/link";
import Image from "next/image";
import type { Locale, SiteSettings } from "@/lib/types";

export function Brand({ locale, settings, inverse = false }: { locale: Locale; settings: SiteSettings; inverse?: boolean }) {
  return (
    <Link href={`/${locale}`} className={`brand${inverse ? " brand--inverse" : ""}`} aria-label={settings.brand_name}>
      {settings.logo_url ? <Image alt="" className="brand-logo-image" height={48} src={settings.logo_url} unoptimized width={160} /> : <strong>{settings.brand_name}</strong>}
    </Link>
  );
}
