import type { CollectionConfig } from "payload";
import { formManager } from "../access";
import { populateSubmissionSummary } from "../hooks/submission-summary";
import { auditCollectionChange, auditCollectionDelete } from "../hooks/audit";
import { localeConfig } from "@/lib/site-config";

export const Forms: CollectionConfig = {
  slug: "forms",
  labels: { singular: "Form", plural: "Forms" },
  admin: { group: "Forms", useAsTitle: "title", defaultColumns: ["title", "key", "isActive", "updatedAt"], listSearchableFields: ["title", "key"] },
  access: { create: formManager, delete: formManager, read: formManager, update: formManager },
  hooks: { afterChange: [auditCollectionChange], afterDelete: [auditCollectionDelete] },
  fields: [
    { name: "key", type: "text", unique: true, required: true, index: true },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "requiresPrivacyConsent", type: "checkbox", defaultValue: true },
    { name: "retentionMonths", type: "number", min: 1, max: 24, defaultValue: 12, required: true },
    { name: "successRedirect", type: "text" },
    { name: "title", type: "text", localized: true, required: true },
    { name: "description", type: "textarea", localized: true },
    { name: "successMessage", type: "textarea", localized: true, required: true },
    { name: "consentLabel", type: "textarea", localized: true },
    {
      name: "fields",
      type: "array",
      fields: [
        { name: "key", type: "text", required: true },
        { name: "fieldType", type: "select", required: true, options: ["text", "textarea", "email", "phone", "number", "select", "multi-select", "radio", "checkbox", "date", "datetime", "url", "file", "hidden"] },
        { name: "required", type: "checkbox", defaultValue: false },
        { name: "minValue", type: "number" },
        { name: "maxValue", type: "number" },
        { name: "minLength", type: "number" },
        { name: "maxLength", type: "number" },
        { name: "pattern", type: "text" },
        { name: "options", type: "json" },
        { name: "label", type: "text", localized: true, required: true },
        { name: "placeholder", type: "text", localized: true },
        { name: "helpText", type: "textarea", localized: true },
        { name: "optionLabels", type: "json", localized: true },
        { name: "enabled", type: "checkbox", defaultValue: true },
      ],
    },
  ],
};

export const FormSubmissions: CollectionConfig = {
  slug: "form-submissions",
  labels: { singular: "Submission", plural: "Submissions" },
  admin: {
    group: "Forms",
    useAsTitle: "contactName",
    defaultColumns: ["contactName", "contactPhone", "company", "form", "status", "priority", "createdAt"],
    listSearchableFields: ["contactName", "contactPhone", "contactEmail", "company"],
    enableListViewSelectAPI: true,
    description: "Form response inbox. Raw submitted values are retained according to the configured retention period.",
  },
  access: { create: () => false, delete: formManager, read: formManager, update: formManager },
  hooks: { beforeValidate: [populateSubmissionSummary], afterChange: [auditCollectionChange], afterDelete: [auditCollectionDelete] },
  fields: [
    { name: "legacyID", type: "text", unique: true, index: true, admin: { hidden: true } },
    { name: "form", type: "relationship", relationTo: "forms", required: true, index: true },
    { name: "files", type: "join", collection: "submission-files", on: "submission" },
    { name: "locale", type: "select", options: localeConfig.map(({ code, label }) => ({ value: code, label })), required: true, index: true },
    { name: "contactName", type: "text", index: true, admin: { readOnly: true } },
    { name: "contactPhone", type: "text", index: true, admin: { readOnly: true } },
    { name: "contactEmail", type: "email", index: true, admin: { readOnly: true } },
    { name: "company", type: "text", index: true, admin: { readOnly: true } },
    { name: "requestType", type: "text", admin: { readOnly: true } },
    { name: "data", type: "json", required: true },
    { name: "status", type: "select", options: ["new", "contacted", "qualified", "closed"], defaultValue: "new", required: true, index: true },
    { name: "priority", type: "select", options: ["low", "normal", "high", "urgent"], defaultValue: "normal", index: true },
    { name: "assignedTo", type: "relationship", relationTo: "users", index: true },
    { name: "contactedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "sourceURL", type: "text" },
    { name: "referrer", type: "text" },
    { name: "consentGiven", type: "checkbox", required: true },
    { name: "consentText", type: "textarea" },
    { name: "userAgent", type: "text", maxLength: 500 },
    { name: "ipHash", type: "text", index: true, admin: { hidden: true } },
    { name: "expiresAt", type: "date", required: true, index: true },
    { name: "internalNotes", type: "textarea" },
  ],
};
