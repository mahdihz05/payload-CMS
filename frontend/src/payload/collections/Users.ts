import type { CollectionConfig } from "payload";
import { adminOnly } from "../access";
import { auditCollectionChange, auditCollectionDelete } from "../hooks/audit";

export const Users: CollectionConfig = {
  slug: "users",
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  admin: { useAsTitle: "email", group: "Administration" },
  access: { create: adminOnly, delete: adminOnly, read: adminOnly, update: adminOnly },
  hooks: { afterChange: [auditCollectionChange], afterDelete: [auditCollectionDelete] },
  fields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "role", type: "select", required: true, defaultValue: "viewer", saveToJWT: true, options: ["admin", "editor", "seo", "viewer"] },
  ],
};
