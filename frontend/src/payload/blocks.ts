import type { Block, Field } from "payload";

const enabledField: Field = { name: "enabled", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } };
const variantField: Field = { name: "variant", type: "select", defaultValue: "default", options: ["default", "simple", "centered", "split", "cards", "compact"], admin: { position: "sidebar" } };
const ctaFields: Field[] = [
  { name: "label", type: "text", localized: true },
  { name: "url", type: "text", localized: true },
  { name: "openInNewTab", type: "checkbox", defaultValue: false },
];

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero sections" },
  imageURL: "/admin-blocks/hero.svg",
  fields: [
    enabledField, variantField,
    { name: "eyebrow", type: "text", localized: true },
    { name: "title", type: "text", localized: true, required: true },
    { name: "highlight", type: "text", localized: true, admin: { description: "Optional text within the title to emphasize." } },
    { name: "body", type: "textarea", localized: true, required: true },
    { name: "primaryCTA", type: "group", fields: ctaFields },
    { name: "secondaryCTA", type: "group", fields: ctaFields },
    { name: "points", type: "array", localized: true, maxRows: 5, fields: [{ name: "text", type: "text", required: true }] },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text section", plural: "Text sections" },
  fields: [enabledField, variantField, { name: "eyebrow", type: "text", localized: true }, { name: "heading", type: "text", localized: true, required: true }, { name: "body", type: "richText", localized: true, required: true }],
};

export const FeatureGridBlock: Block = {
  slug: "featureGrid",
  labels: { singular: "Feature grid", plural: "Feature grids" },
  fields: [
    enabledField, variantField,
    { name: "eyebrow", type: "text", localized: true },
    { name: "heading", type: "text", localized: true, required: true },
    { name: "intro", type: "textarea", localized: true },
    { name: "items", type: "array", minRows: 1, maxRows: 12, fields: [
      { name: "icon", type: "text", admin: { description: "A short text or icon name." } },
      { name: "title", type: "text", localized: true, required: true },
      { name: "description", type: "textarea", localized: true, required: true },
      { name: "url", type: "text", localized: true },
    ] },
  ],
};

export const FAQBlock: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQ sections" },
  fields: [enabledField, variantField, { name: "heading", type: "text", localized: true, required: true }, { name: "items", type: "array", minRows: 1, maxRows: 20, fields: [{ name: "question", type: "text", localized: true, required: true }, { name: "answer", type: "textarea", localized: true, required: true }] }],
};

export const TestimonialBlock: Block = {
  slug: "testimonials",
  labels: { singular: "Testimonials", plural: "Testimonial sections" },
  fields: [enabledField, variantField, { name: "heading", type: "text", localized: true, required: true }, { name: "items", type: "array", minRows: 1, maxRows: 8, fields: [{ name: "quote", type: "textarea", localized: true, required: true }, { name: "name", type: "text", localized: true, required: true }, { name: "role", type: "text", localized: true }, { name: "company", type: "text", localized: true }] }],
};

export const CTABlock: Block = {
  slug: "cta",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [enabledField, variantField, { name: "eyebrow", type: "text", localized: true }, { name: "title", type: "text", localized: true, required: true }, { name: "body", type: "textarea", localized: true }, { name: "primaryCTA", type: "group", fields: ctaFields }],
};

export const FormBlock: Block = {
  slug: "form",
  labels: { singular: "Form", plural: "Forms" },
  fields: [
    enabledField, variantField,
    { name: "form", type: "relationship", relationTo: "forms", required: true, maxDepth: 1, filterOptions: { isActive: { equals: true } }, admin: { description: "Select the active form displayed in this section." } },
    { name: "eyebrow", type: "text", localized: true },
    { name: "heading", type: "text", localized: true, admin: { description: "Uses the form title when empty." } },
    { name: "intro", type: "textarea", localized: true, admin: { description: "Uses the form description when empty." } },
    { name: "context", type: "text", localized: true, admin: { description: "Optional context submitted with the form, such as a page or campaign key." } },
  ],
};

export const contentBlocks = [HeroBlock, RichTextBlock, FeatureGridBlock, FAQBlock, TestimonialBlock, CTABlock, FormBlock];
