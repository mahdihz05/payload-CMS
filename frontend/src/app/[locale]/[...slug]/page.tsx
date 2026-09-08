import type { Metadata } from "next";
import config from "@payload-config";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import { BlockRenderer } from "@/components/block-renderer";
import { ContentStructuredData } from "@/components/content-structured-data";
import { isLocale } from "@/lib/locales";
import { cms } from "@/lib/payload-cms";
import { contentSeoMetadata } from "@/lib/seo";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/[...slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const query = await searchParams;
  const previewRequested = query.draft === "1";
  const authorized = previewRequested && Boolean((await (await getPayload({ config })).auth({ headers: await headers() })).user);
  return contentSeoMetadata(locale, slug.join("/"), authorized, authorized);
}

export default async function GenericCmsPage({ params, searchParams }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  let draft = false;
  if (query.draft === "1") {
    const payload = await getPayload({ config });
    draft = Boolean((await payload.auth({ headers: await headers() })).user);
  }
  const path = slug.join("/");
  const content = await cms.content(locale, path, draft);
  if (!content) notFound();
  return <><ContentStructuredData locale={locale} path={path} /><main>{content.blocks.map((block) => <BlockRenderer key={block.id} block={block} locale={locale} />)}</main></>;
}
