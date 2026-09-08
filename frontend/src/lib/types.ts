export type { Locale } from "./site-config";
import type { Locale } from "./site-config";

export type ApiEnvelope<T> = { data: T };

export type NavigationItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  column: number;
  open_in_new_tab: boolean;
  featured_image: string | null;
  children: NavigationItem[];
};

export type SiteSettings = {
  brand_name: string;
  phone: string;
  email: string;
  default_locale: Locale;
  customer_portal_url: string;
  location: string;
  address: string;
  seo: { title: string; description: string };
  logo_url: string | null;
};

export type ContentBlock = {
  id: string;
  type: string;
  variant: string;
  order: number;
  props: Record<string, unknown>;
};

export type ContentSummary = {
  id: string;
  key: string;
  kind: string;
  locale: Locale;
  title: string;
  slug: string;
  url: string;
  excerpt: string;
  published_at?: string | null;
};

export type ContentDetail = ContentSummary & {
  templateKey: string;
  blocks: ContentBlock[];
  seo: {
    title: string;
    description: string;
    canonical_url: string;
    robots: { index: boolean; follow: boolean };
    open_graph: { title: string; description: string; image: string | null };
  };
  alternates: { locale: Locale; url: string }[];
};

export type SearchResult = { kind: string; title: string; summary: string; url: string };
