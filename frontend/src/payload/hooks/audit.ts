import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

const SKIP_AUDIT = "skipAuditLog";
const SENSITIVE_KEYS = new Set(["hash", "salt", "password", "resetPasswordToken", "resetPasswordExpiration", "sessions", "data", "ipHash", "userAgent"]);

function safeSnapshot(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([key]) => !SENSITIVE_KEYS.has(key)));
}

function actionFor(operation: "create" | "update", before: Record<string, unknown>, after: Record<string, unknown>) {
  if (operation === "create") return after._status === "published" ? "publish" : "create";
  if (before._status !== "published" && after._status === "published") return "publish";
  if (before._status === "published" && after._status !== "published") return "unpublish";
  return "update";
}

async function record({ collection, objectID, action, before, after, req }: {
  collection: string;
  objectID: string;
  action: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  req: Parameters<CollectionAfterChangeHook>[0]["req"];
}) {
  if (!req.user || req.context[SKIP_AUDIT]) return;
  await req.payload.create({
    collection: "audit-logs",
    overrideAccess: true,
    req,
    context: { ...req.context, [SKIP_AUDIT]: true },
    data: {
      actor: req.user.id,
      actorType: "admin",
      action,
      objectType: collection,
      objectID,
      before,
      after,
      occurredAt: new Date().toISOString(),
    },
  });
}

export const auditCollectionChange: CollectionAfterChangeHook = async ({ collection, doc, operation, previousDoc, req }) => {
  const before = safeSnapshot(previousDoc);
  const after = safeSnapshot(doc);
  await record({ collection: collection.slug, objectID: String(doc.id), action: actionFor(operation, before, after), before, after, req });
};

export const auditCollectionDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  await record({ collection: collection.slug, objectID: String(doc.id), action: "delete", before: safeSnapshot(doc), after: {}, req });
};

export const auditGlobalChange: GlobalAfterChangeHook = async ({ global, doc, previousDoc, req }) => {
  await record({ collection: global.slug, objectID: global.slug, action: "update", before: safeSnapshot(previousDoc), after: safeSnapshot(doc), req });
};
