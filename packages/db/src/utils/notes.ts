import type { JSONContent } from "../schema/notes";

/**
 * Recursively extracts plain text from TipTap JSONContent
 */
export function extractPlainText(content: JSONContent | null | undefined): string {
  if (!content) return "";
  let text = content.text ?? "";
  if (content.content) {
    text += content.content.map(extractPlainText).join(" ");
  }
  return text.trim();
}
