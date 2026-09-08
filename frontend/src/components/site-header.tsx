"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { Brand } from "./brand";
import { localeMeta, locales, ui } from "@/lib/locales";
import type { Locale, NavigationItem, SiteSettings } from "@/lib/types";

export function SiteHeader({ locale, items, settings }: { locale: Locale; items: NavigationItem[]; settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const labels = ui[locale];

  function localizedPath(nextLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }

  function handleLocalizedAlternate(event: MouseEvent<HTMLAnchorElement>, nextLocale: Locale) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const alternate = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${localeMeta[nextLocale].lang}"]`);
    if (!alternate?.href) return;
    event.preventDefault();
    window.location.assign(alternate.href);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand locale={locale} settings={settings} />
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
          <span className="sr-only">{open ? labels.close : labels.menu}</span><span aria-hidden="true">{open ? "x" : "+"}</span>
        </button>
        <nav id="site-navigation" className={open ? "main-nav is-open" : "main-nav"} aria-label={labels.navigation}>
          {items.map((item) => item.children.length ? (
            <details key={item.id}><summary>{item.title}</summary><div>{item.children.map((child) => <Link key={child.id} href={child.url} target={child.open_in_new_tab ? "_blank" : undefined} onClick={() => setOpen(false)}>{child.title}</Link>)}</div></details>
          ) : <Link key={item.id} href={item.url} target={item.open_in_new_tab ? "_blank" : undefined} onClick={() => setOpen(false)}>{item.title}</Link>)}
        </nav>
        <details className="language-switcher">
          <summary aria-label="Change language"><span>{localeMeta[locale].short}</span></summary>
          <div className="language-menu">{locales.map((item) => <Link key={item} href={localizedPath(item)} lang={localeMeta[item].lang} hrefLang={localeMeta[item].lang} aria-current={item === locale ? "page" : undefined} onClick={(event) => handleLocalizedAlternate(event, item)}>{localeMeta[item].label}</Link>)}</div>
        </details>
      </div>
    </header>
  );
}
