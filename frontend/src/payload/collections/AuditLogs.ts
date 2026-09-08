import type { CollectionConfig } from "payload";
import { adminOnly } from "../access";

export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  admin: { group: "System", useAsTitle: "action", defaultColumns: ["action", "objectType", "objectID", "actorType", "occurredAt"] },
  access: { create: () => false, delete: () => false, read: adminOnly, update: () => false },
  fields: [
    { name: "legacyID", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "actor", type: "relationship", relationTo: "users" },
    { name: "actorType", type: "text", required: true, defaultValue: "admin" },
    { name: "action", type: "text", required: true, index: true },
    { name: "objectType", type: "text", required: true, index: true },
    { name: "objectID", type: "text", required: true, index: true },
    { name: "before", type: "json", defaultValue: {} },
    { name: "after", type: "json", defaultValue: {} },
    { name: "occurredAt", type: "date", required: true, index: true },
  ],
};
