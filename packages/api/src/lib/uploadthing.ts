import { UTApi } from "uploadthing/server";

import type { JSONContent } from "@dunzio/db/schema/projects";

export const utapi = new UTApi();

/**
 * Recursively extract all UploadThing image URLs from TipTap JSONContent.
 */
export function extractUploadThingUrls(content: JSONContent | null | undefined): string[] {
  if (!content) return [];
  const urls: string[] = [];

  if (content.type === "image" && typeof content.attrs?.src === "string") {
    const src = content.attrs.src;
    if (src.includes("utfs.io") || src.includes("ufs.sh")) {
      urls.push(src);
    }
  }

  if (content.content) {
    for (const child of content.content) {
      urls.push(...extractUploadThingUrls(child));
    }
  }
  return urls;
}

/**
 * Extract UploadThing file keys from URLs.
 * URL format: https://<host>/f/<fileKey>
 */
export function getFileKeysFromUrls(urls: string[]): string[] {
  return urls
    .map((url) => {
      try {
        const pathname = new URL(url).pathname;
        const parts = pathname.split("/f/");
        return parts[1] ?? null;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as string[];
}

/**
 * Delete all UploadThing files referenced in tasks' TipTap content.
 * Call BEFORE deleting tasks from the DB.
 */
export async function deleteUploadThingFilesForTasks(
  tasks: { content: JSONContent | null }[]
): Promise<void> {
  const urls = tasks.flatMap((t) => extractUploadThingUrls(t.content));
  const keys = getFileKeysFromUrls(urls);

  if (keys.length > 0) {
    try {
      await utapi.deleteFiles(keys);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete UploadThing files:", error);
    }
  }
}
