import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import sharp from "sharp";
import type { Media, User } from "@/payload-types";

const enabled = process.env.RUN_PAYLOAD_INTEGRATION === "1";
const suffix = `${Date.now()}`;
const password = "Test-only-password-123!";
let png: Buffer;
let payload: Payload;
let admin: User;
let editor: User;
let viewer: User;
const media: Media[] = [];

describe.skipIf(!enabled)("generic core subsystems", () => {
  beforeAll(async () => {
    png = await sharp({ create: { width: 2, height: 2, channels: 4, background: "#3366ff" } }).png().toBuffer();
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    [admin, editor, viewer] = await Promise.all([
      payload.create({ collection: "users", overrideAccess: true, data: { email: `core-admin-${suffix}@example.test`, password, name: "Core admin", role: "admin" } }),
      payload.create({ collection: "users", overrideAccess: true, data: { email: `core-editor-${suffix}@example.test`, password, name: "Core editor", role: "editor" } }),
      payload.create({ collection: "users", overrideAccess: true, data: { email: `core-viewer-${suffix}@example.test`, password, name: "Core viewer", role: "viewer" } }),
    ]);
  });

  afterAll(async () => {
    if (!payload) return;
    for (const document of media) await payload.delete({ collection: "media", id: document.id, overrideAccess: true });
    for (const user of [admin, editor, viewer].filter(Boolean)) await payload.delete({ collection: "users", id: user.id, overrideAccess: true });
  });

  it("stores localized media ALT and protects private media from anonymous reads", async () => {
    const file = (name: string) => ({ data: png, mimetype: "image/png", name, size: png.byteLength });
    const publicMedia = await payload.create({ collection: "media", locale: "en", overrideAccess: false, user: editor, file: file(`public-${suffix}.png`), data: { alt: "Public example", isPublic: true } });
    media.push(publicMedia);
    await payload.update({ collection: "media", id: publicMedia.id, locale: "fa", overrideAccess: false, user: editor, data: { alt: "نمونه عمومی" } });
    expect((await payload.findByID({ collection: "media", id: publicMedia.id, locale: "fa", fallbackLocale: false, overrideAccess: true })).alt).toBe("نمونه عمومی");

    const privateMedia = await payload.create({ collection: "media", locale: "en", overrideAccess: false, user: editor, file: file(`private-${suffix}.png`), data: { alt: "Private example", isPublic: false } });
    media.push(privateMedia);
    const anonymous = await payload.find({ collection: "media", overrideAccess: false, depth: 0, where: { id: { in: [publicMedia.id, privateMedia.id] } } });
    expect(anonymous.docs.map(({ id }) => id)).toEqual([publicMedia.id]);
    expect((await payload.find({ collection: "media", overrideAccess: false, user: viewer, depth: 0, where: { id: { equals: privateMedia.id } } })).docs).toHaveLength(1);
  });

  it("records generic audit entries and restricts log reads to administrators", async () => {
    const logs = await payload.find({ collection: "audit-logs", overrideAccess: false, user: admin, limit: 100, where: { objectType: { equals: "media" } } });
    expect(logs.totalDocs).toBeGreaterThan(0);
    await expect(payload.find({ collection: "audit-logs", overrideAccess: false, user: viewer, limit: 1 })).rejects.toThrow();
  });
});
