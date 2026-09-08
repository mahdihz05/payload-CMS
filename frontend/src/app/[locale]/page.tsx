import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/block-renderer";
import { isLocale } from "@/lib/locales";
import { cms } from "@/lib/payload-cms";
import { contentSeoMetadata } from "@/lib/seo";
import { ContentStructuredData } from "@/components/content-structured-data";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return contentSeoMetadata(locale, "");
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const home = await cms.home(locale);
  if (!home) notFound();
  return <><ContentStructuredData locale={locale} path="" /><main>{home.blocks.map((block) => <BlockRenderer key={block.id} block={block} locale={locale} />)}</main></>;
}
