import type { CollectionConfig } from "payload";
import { contentManager } from "../access";
import { validatePublicMediaUpload } from "../validation/uploads";
import { auditCollectionChange, auditCollectionDelete } from "../hooks/audit";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media", plural: "Media library" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["filename", "title", "isPublic", "updatedAt"], listSearchableFields: ["filename", "title", "alt"] },
  access: {
    create: contentManager,
    delete: contentManager,
    read: ({ req }) => (req.user ? true : { isPublic: { equals: true } }),
    update: contentManager,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre", withoutEnlargement: true },
      { name: "card", width: 960, height: 640, position: "centre", withoutEnlargement: true },
      { name: "hero", width: 1920, height: 1080, position: "centre", withoutEnlargement: true },
    ],
  },
  hooks: { beforeValidate: [validatePublicMediaUpload], afterChange: [auditCollectionChange], afterDelete: [auditCollectionDelete] },
  fields: [
    { name: "legacyID", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "isPublic", type: "checkbox", defaultValue: true, index: true },
    { name: "alt", type: "text", localized: true, required: true, maxLength: 180 },
    { name: "title", type: "text", localized: true, maxLength: 180 },
    { name: "caption", type: "textarea", localized: true, maxLength: 500 },
  ],
};
