import type { Access, FieldAccess, GlobalConfig } from "payload";
import type { User } from "@/payload-types";

export type UserRole = "admin" | "editor" | "seo" | "viewer";

export function hasRole(user: unknown, roles: UserRole[]) {
  return Boolean(user && roles.includes((user as User).role as UserRole));
}

export const adminOnly: Access = ({ req }) => hasRole(req.user, ["admin"]);
export const contentManager: Access = ({ req }) => hasRole(req.user, ["admin", "editor"]);
export const seoManager: Access = ({ req }) => hasRole(req.user, ["admin", "editor", "seo"]);
export const contentFieldManager: FieldAccess = ({ req }) => hasRole(req.user, ["admin", "editor"]);
export const seoFieldManager: FieldAccess = ({ req }) => hasRole(req.user, ["admin", "editor", "seo"]);
export const formManager: Access = ({ req }) => hasRole(req.user, ["admin", "editor"]);
export const contentReader: Access = ({ req }) => hasRole(req.user, ["admin", "editor", "seo", "viewer"]);
export const authenticated: Access = contentReader;
export const authenticatedGlobal: NonNullable<GlobalConfig["access"]>["read"] = ({ req }) => contentReader({ req } as Parameters<Access>[0]);

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (contentReader({ req } as Parameters<Access>[0])) return true;
  return { _status: { equals: "published" } };
};
