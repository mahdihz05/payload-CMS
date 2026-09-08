import { createHash } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";
import type { CollectionBeforeValidateHook } from "payload";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_EXPANDED_SIZE = 50 * 1024 * 1024;
const MAX_PUBLIC_MEDIA_SIZE = 20 * 1024 * 1024;
const ALLOWED = new Map([
  ["pdf", new Set(["application/pdf", "application/octet-stream"])],
  ["docx", new Set(["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream", "application/zip"])],
  ["xlsx", new Set(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream", "application/zip"])],
  ["jpg", new Set(["image/jpeg", "application/octet-stream"])],
  ["jpeg", new Set(["image/jpeg", "application/octet-stream"])],
  ["png", new Set(["image/png", "application/octet-stream"])],
]);

function extensionOf(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

async function validateOffice(buffer: Buffer, extension: "docx" | "xlsx") {
  const archive = await JSZip.loadAsync(buffer, { checkCRC32: true });
  const entries = Object.values(archive.files).filter((entry) => !entry.dir);
  const expected = extension === "docx" ? "word/document.xml" : "xl/workbook.xml";
  if (!archive.file(expected) || !archive.file("[Content_Types].xml")) throw new Error("The Office document structure is invalid.");
  if (entries.some((entry) => entry.name.toLowerCase().endsWith("vbaproject.bin"))) throw new Error("Macro-enabled Office documents are not allowed.");
  if (entries.length > 5000) throw new Error("The Office document contains too many internal files.");
  let expandedSize = 0;
  for (const entry of entries) {
    expandedSize += (await entry.async("uint8array")).byteLength;
    if (expandedSize > MAX_EXPANDED_SIZE) throw new Error("The Office document expands beyond the safety limit.");
  }
}

export const validatePrivateUpload: CollectionBeforeValidateHook = async ({ data, req }) => {
  const file = req.file;
  if (!file) return data;
  if (file.size > MAX_FILE_SIZE) throw new Error("Each file must be 10MB or smaller.");
  const extension = extensionOf(file.name);
  const allowedMimes = ALLOWED.get(extension);
  if (!allowedMimes) throw new Error("This file type is not allowed.");
  if (!allowedMimes.has(file.mimetype.toLowerCase())) throw new Error("The declared MIME type does not match the file extension.");

  const detected = await fileTypeFromBuffer(file.data);
  if (extension === "pdf" && detected?.mime !== "application/pdf") throw new Error("The file signature does not match PDF.");
  if (["jpg", "jpeg"].includes(extension) && detected?.mime !== "image/jpeg") throw new Error("The file signature does not match the image extension.");
  if (extension === "png" && detected?.mime !== "image/png") throw new Error("The file signature does not match the image extension.");
  if (extension === "docx" || extension === "xlsx") await validateOffice(file.data, extension);

  return {
    ...data,
    originalName: file.name,
    checksumSHA256: createHash("sha256").update(file.data).digest("hex"),
  };
};

export const validatePublicMediaUpload: CollectionBeforeValidateHook = async ({ data, req }) => {
  const file = req.file;
  if (!file) return data;
  if (file.size > MAX_PUBLIC_MEDIA_SIZE) throw new Error("Media files must be 20MB or smaller.");

  const declared = file.mimetype.toLowerCase();
  const detected = await fileTypeFromBuffer(file.data);
  const expected = new Map([
    ["jpg", "image/jpeg"],
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
    ["pdf", "application/pdf"],
  ]);
  const extension = extensionOf(file.name);
  const mime = expected.get(extension);
  if (!mime || declared !== mime || detected?.mime !== mime) throw new Error("Unsupported or invalid media file.");
  return data;
};
