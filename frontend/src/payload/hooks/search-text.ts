import type { CollectionBeforeChangeHook } from "payload";
import { normalizeSearchText } from "@/lib/search-normalization";

export const populateSearchText: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const title = typeof data.title === "string" ? data.title : typeof originalDoc?.title === "string" ? originalDoc.title : "";
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : typeof originalDoc?.excerpt === "string" ? originalDoc.excerpt : "";
  return { ...data, searchText: normalizeSearchText(`${title} ${excerpt}`) };
};
