import type { Content, Media } from "@/payload-types";
import type { Locale } from "./types";

export type PublicContentType = "page" | "service" | "solution" | "independent-service" | "editorial";

export type TranslationAvailability = {
  locale: Locale;
  path: string | null;
  isPublished: boolean;
  isActive: boolean;
  isRouteValid: boolean;
  hasUniquePath: boolean;
};

export type SeoSourceFields = {
  title: string | null;
  description: string | null;
  canonicalOverride: string | null;
  canonicalOverrideEnabled: boolean;
  robotsIndex: boolean;
  robotsFollow: boolean;
  socialTitle: string | null;
  socialDescription: string | null;
  socialImage: Media | number | null;
};

export type SeoSiteInput = {
  origin: string;
  defaultLocale: Locale;
  title: string;
  description: string;
  brandName: string;
  logo: Media | number | null;
};

export type SeoPreviewState = { enabled: boolean; authorized: boolean };

export type SeoSchemaInput = {
  type: "page" | "article" | "service" | "product";
  breadcrumbs: { label: string; path: string }[];
  article?: { authorName: string; publishedAt: string; modifiedAt: string | null };
  service?: { name: string; description: string };
  product?: { name: string; description: string; currency: string; price: number };
  visibleFaqs?: { question: string; answer: string }[];
};

export type SeoDocumentInput = {
  identity: {
    id: number;
    key: string;
    contentType: PublicContentType;
    templateKey: string;
    locale: Locale;
    slug: string;
    path: string;
  };
  content: {
    title: string;
    excerpt: string | null;
    blocks: NonNullable<Content["layout"]>;
    h1: string;
  };
  seo: SeoSourceFields;
  workflow: {
    status: "draft" | "published";
    workflowStatus: Content["workflowStatus"];
    isActive: boolean;
    isDeleted: boolean;
    isRedirectSource: boolean;
  };
  translations: TranslationAvailability[];
  preview: SeoPreviewState;
  schema: SeoSchemaInput;
};

export function contentTypeFor(document: Pick<Content, "kind" | "templateKey">): PublicContentType {
  if (document.templateKey === "independent-service") return "independent-service";
  if (document.kind === "knowledge" || document.kind === "news") return "editorial";
  return document.kind;
}
