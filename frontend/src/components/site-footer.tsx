import Link from "next/link";
import { Brand } from "./brand";
import { ui } from "@/lib/locales";
import type { Locale, NavigationItem, SiteSettings } from "@/lib/types";

export function SiteFooter({ locale, items, settings }: { locale: Locale; items: NavigationItem[]; settings: SiteSettings }) {
  const year = new Intl.NumberFormat(locale, { useGrouping: false }).format(new Date().getFullYear());
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-intro"><Brand locale={locale} settings={settings} inverse /><p>{settings.seo.description}</p></div>
        <nav className="footer-nav" aria-label={ui[locale].navigation}>{items.map((item) => <Link key={item.id} href={item.url}>{item.title}</Link>)}</nav>
        <div className="footer-contact">{settings.phone ? <a dir="ltr" href={`tel:${settings.phone}`}>{settings.phone}</a> : null}{settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : null}{settings.location ? <span>{settings.location}</span> : null}</div>
      </div>
      <div className="container footer-bottom"><span>© {year} {settings.brand_name}. {ui[locale].rights}</span></div>
    </footer>
  );
}
