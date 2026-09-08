import type { CollectionConfig } from "payload";
import { formManager } from "../access";
import { validatePrivateUpload } from "../validation/uploads";
import { auditCollectionChange, auditCollectionDelete } from "../hooks/audit";

export const SubmissionFiles: CollectionConfig = {
  slug: "submission-files",
  admin: { group: "Forms", useAsTitle: "originalName" },
  access: { create: () => false, delete: formManager, read: formManager, update: formManager },
  upload: { staticDir: "private-media/form-submissions", disableLocalStorage: false },
  hooks: { beforeValidate: [validatePrivateUpload], afterChange: [auditCollectionChange], afterDelete: [auditCollectionDelete] },
  fields: [
    { name: "legacyID", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "submission", type: "relationship", relationTo: "form-submissions", required: true, index: true },
    { name: "originalName", type: "text", required: true },
    { name: "checksumSHA256", type: "text", required: true },
  ],
};
