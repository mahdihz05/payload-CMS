import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { CmsForm } from "@/components/cms-form";
import type { Form } from "@/payload-types";
import type { ContentBlock, Locale } from "@/lib/types";

type Props = { block: ContentBlock; locale: Locale };

function text(value: unknown) { return typeof value === "string" ? value : ""; }
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }

function Action({ value, className }: { value: unknown; className: string }) {
  const action = record(value);
  const label = text(action.label);
  const url = text(action.url);
  if (!label || !url) return null;
  const external = action.openInNewTab === true;
  return <Link className={className} href={url} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{label}</Link>;
}

function Hero({ block }: Props) {
  const points = Array.isArray(block.props.points) ? block.props.points.map(record).map((item) => text(item.text)).filter(Boolean) : [];
  return <section className="hero"><div className="container hero-layout"><div className="hero-copy">{text(block.props.eyebrow) ? <p className="eyebrow">{text(block.props.eyebrow)}</p> : null}<h1>{text(block.props.title)}</h1><p className="hero-body">{text(block.props.body)}</p><div className="hero-actions"><Action className="button button-primary" value={block.props.primaryCTA} /><Action className="button button-secondary" value={block.props.secondaryCTA} /></div>{points.length ? <ul className="hero-points">{points.map((point) => <li key={point}>{point}</li>)}</ul> : null}</div></div></section>;
}

function RichTextSection({ block }: Props) {
  const body = block.props.body;
  return <section className="section cms-rich-section"><div className="container cms-narrow">{text(block.props.eyebrow) ? <span className="section-kicker">{text(block.props.eyebrow)}</span> : null}<h2>{text(block.props.heading)}</h2><div className="cms-rich-body">{body && typeof body === "object" ? <RichText data={body as Parameters<typeof RichText>[0]["data"]} /> : null}</div></div></section>;
}

function FeatureGrid({ block, locale }: Props) {
  const items = Array.isArray(block.props.items) ? block.props.items.map(record) : [];
  return <section className="section cms-feature-section"><div className="container"><div className="public-section-heading">{text(block.props.eyebrow) ? <span>{text(block.props.eyebrow)}</span> : null}<div><h2>{text(block.props.heading)}</h2>{text(block.props.intro) ? <p>{text(block.props.intro)}</p> : null}</div></div><div className="cms-feature-grid">{items.map((item, index) => { const url = text(item.url); const content = <><span aria-hidden="true">{text(item.icon) || String(index + 1).padStart(2, "0")}</span><h3>{text(item.title)}</h3><p>{text(item.description)}</p></>; return url ? <Link href={url.startsWith("/") || url.startsWith("http") ? url : `/${locale}/${url}`} key={`${text(item.title)}-${index}`}>{content}</Link> : <article key={`${text(item.title)}-${index}`}>{content}</article>; })}</div></div></section>;
}

function FAQ({ block }: Props) {
  const items = Array.isArray(block.props.items) ? block.props.items.map(record) : [];
  return <section className="section cms-faq-section"><div className="container cms-narrow"><h2>{text(block.props.heading)}</h2><div className="cms-faq-list">{items.map((item, index) => <details key={`${text(item.question)}-${index}`}><summary>{text(item.question)}</summary><p>{text(item.answer)}</p></details>)}</div></div></section>;
}

function Testimonials({ block }: Props) {
  const items = Array.isArray(block.props.items) ? block.props.items.map(record) : [];
  return <section className="section cms-testimonial-section"><div className="container"><h2>{text(block.props.heading)}</h2><div className="cms-testimonial-grid">{items.map((item, index) => <figure key={`${text(item.name)}-${index}`}><blockquote>{text(item.quote)}</blockquote><figcaption><b>{text(item.name)}</b><span>{[text(item.role), text(item.company)].filter(Boolean).join(" · ")}</span></figcaption></figure>)}</div></div></section>;
}

function CallToAction({ block }: Props) {
  return <section className="section"><div className="container"><div className="cta-panel"><div>{text(block.props.eyebrow) ? <span>{text(block.props.eyebrow)}</span> : null}<h2>{text(block.props.title)}</h2>{text(block.props.body) ? <p>{text(block.props.body)}</p> : null}</div><Action className="button button-light" value={block.props.primaryCTA} /></div></div></section>;
}

function FormSection({ block, locale }: Props) {
  const form = block.props.form;
  if (!form || typeof form !== "object" || !("key" in form)) return null;
  const selectedForm = form as Form;
  if (selectedForm.isActive === false) return null;
  return <CmsForm form={selectedForm} locale={locale} eyebrow={text(block.props.eyebrow)} heading={text(block.props.heading)} intro={text(block.props.intro)} context={text(block.props.context)} compact={block.variant === "compact"} />;
}

export function BlockRenderer(props: Props) {
  if (props.block.type === "hero") return <Hero {...props} />;
  if (props.block.type === "richText") return <RichTextSection {...props} />;
  if (props.block.type === "featureGrid") return <FeatureGrid {...props} />;
  if (props.block.type === "faq") return <FAQ {...props} />;
  if (props.block.type === "testimonials") return <Testimonials {...props} />;
  if (props.block.type === "cta") return <CallToAction {...props} />;
  if (props.block.type === "form") return <FormSection {...props} />;
  return null;
}
