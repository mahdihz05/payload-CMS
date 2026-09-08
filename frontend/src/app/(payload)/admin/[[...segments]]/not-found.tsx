import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";
import { importMap } from "../importMap.js";

export default function PayloadNotFound() {
  const params = Promise.resolve({ segments: [] as string[] });
  const searchParams = Promise.resolve({} as Record<string, string | string[]>);
  return NotFoundPage({ config, importMap, params, searchParams });
}
