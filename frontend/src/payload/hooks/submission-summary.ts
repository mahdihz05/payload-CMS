import type { CollectionBeforeValidateHook } from "payload";

function stringValue(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 250);
  }
  return "";
}

export const populateSubmissionSummary: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data;
  const values = data.data && typeof data.data === "object" && !Array.isArray(data.data)
    ? data.data as Record<string, unknown>
    : {};

  return {
    ...data,
    contactName: data.contactName || stringValue(values, ["full_name", "name", "contact_name"]),
    contactPhone: data.contactPhone || stringValue(values, ["phone", "mobile", "telephone"]),
    contactEmail: data.contactEmail || stringValue(values, ["email", "contact_email"]),
    company: data.company || stringValue(values, ["company", "organization", "company_name"]),
    requestType: data.requestType || stringValue(values, ["need_type", "request_type", "service", "package"]),
  };
};
