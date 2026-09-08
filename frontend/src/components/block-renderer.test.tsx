import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlockRenderer } from "./block-renderer";
import type { ContentBlock } from "@/lib/types";

function render(type: string, props: Record<string, unknown>) {
  const block: ContentBlock = { id: type, type, variant: "default", order: 0, props };
  return renderToStaticMarkup(<BlockRenderer block={block} locale="en" />);
}

describe("generic block renderer", () => {
  it("renders accessible structure for every public block", () => {
    expect(render("hero", { title: "Welcome", body: "Introduction", primaryCTA: { label: "Continue", url: "/en/contact" }, points: [{ text: "Fast" }] })).toContain("<h1>Welcome</h1>");
    expect(render("richText", { heading: "Story", body: { root: { type: "root", children: [], direction: null, format: "", indent: 0, version: 1 } } })).toContain("<h2>Story</h2>");
    expect(render("featureGrid", { heading: "Features", items: [{ title: "Typed", description: "Reusable" }] })).toContain("<article");
    expect(render("faq", { heading: "Questions", items: [{ question: "Why?", answer: "Because." }] })).toContain("<summary>Why?</summary>");
    expect(render("testimonials", { heading: "Feedback", items: [{ quote: "Useful", name: "Example person" }] })).toContain("<blockquote>Useful</blockquote>");
    expect(render("cta", { title: "Next step", primaryCTA: { label: "Start", url: "/en/contact" } })).toContain(">Start</a>");
    expect(render("form", { form: { id: 1, key: "contact", title: "Contact", successMessage: "Received", retentionMonths: 12, fields: [{ id: "name", key: "name", fieldType: "text", required: true, label: "Name" }], createdAt: "", updatedAt: "" } })).toContain("<form");
  });
});
