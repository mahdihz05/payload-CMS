import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AmbientMotion } from "@/components/ambient-motion";
import { OrganizationJsonLd } from "@/components/structured-data";
import { ibmPlexArabic, inter, vazirmatn } from "../fonts";
import { isLocale, localeMeta } from "@/lib/locales";
import { cms } from "@/lib/payload-cms";
import { siteURL } from "@/lib/site-config";
import "../globals.css";

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const settings = await cms.settings(locale);
  return { metadataBase: new URL(siteURL()), title: { default: settings.seo.title, template: `%s | ${settings.brand_name}` }, description: settings.seo.description };
}

export default async function InternalLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [settings, header, footer, design] = await Promise.all([
    cms.settings(locale),
    cms.navigation("header", locale),
    cms.navigation("footer", locale),
    cms.designSettings(),
  ]);
  const meta = localeMeta[locale];
  return (
    <html lang={meta.lang} dir={meta.dir} className={`${vazirmatn.variable} ${inter.variable} ${ibmPlexArabic.variable}`}>
      <body className="internal-body" style={{
        "--ink": design.foreground,
        "--muted": design.muted,
        "--blue": design.primary,
        "--cyan": design.accent,
        "--pale": design.surface,
        "--surface": design.background,
        "--navy": design.secondary,
        "--radius": `${design.radiusLarge}px`,
        "--container-width": `${design.containerWidth}px`,
        "--section-spacing": `${design.sectionSpacing}px`,
        "--cms-motion-duration": design.motionEnabled ? "0.2s" : "0s",
      } as CSSProperties}>
        <AmbientMotion />
        <OrganizationJsonLd settings={settings} />
        <SiteHeader locale={locale} items={header} settings={settings} />
        {children}
        <SiteFooter locale={locale} items={footer} settings={settings} />
      </body>
    </html>
  );
}
