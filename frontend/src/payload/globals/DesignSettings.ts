import type { GlobalConfig } from "payload";
import { adminOnly } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";
import { auditGlobalChange } from "../hooks/audit";

const color = (name: string, value: string) => ({ name, type: "text" as const, defaultValue: value, required: true, validate: (input: null | string | undefined) => !input || /^#[0-9a-f]{6}$/i.test(input) || "Use a six-digit hexadecimal color." });

export const DesignSettings: GlobalConfig = {
  slug: "design-settings",
  label: "Design settings",
  admin: { group: "Configuration" },
  access: { read: () => true, update: adminOnly },
  hooks: { afterChange: [revalidateGlobal, auditGlobalChange] },
  versions: { max: 25 },
  fields: [
    color("primary", "#2f6bff"), color("secondary", "#0b1023"), color("accent", "#31a9de"),
    color("background", "#ffffff"), color("surface", "#f4f8ff"), color("foreground", "#172039"), color("muted", "#667085"),
    { name: "radiusSmall", type: "number", defaultValue: 8, min: 0 },
    { name: "radiusMedium", type: "number", defaultValue: 12, min: 0 },
    { name: "radiusLarge", type: "number", defaultValue: 20, min: 0 },
    { name: "containerWidth", type: "number", defaultValue: 1180, min: 960, max: 1600 },
    { name: "sectionSpacing", type: "number", defaultValue: 96, min: 48, max: 160 },
    { name: "motionEnabled", type: "checkbox", defaultValue: true },
  ],
};
