import type { JSONContent } from "@tiptap/react";

export function tiptapDocFromPlainText(text: string | null | undefined): JSONContent {
  const trimmed = (text ?? "").trim();

  if (!trimmed) {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    };
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      },
    ],
  };
}

export function isEmptyTiptapDoc(doc: JSONContent | null | undefined): boolean {
  if (!doc) return true;
  const content = doc.content;
  if (!Array.isArray(content) || content.length === 0) return true;

  // Treat a single empty paragraph as empty.
  if (
    content.length === 1 &&
    content[0]?.type === "paragraph" &&
    (!Array.isArray(content[0].content) || content[0].content.length === 0)
  ) {
    return true;
  }

  return false;
}

export function extractPlainTextFromTiptap(doc: JSONContent | null | undefined): string {
  if (!doc) return "";

  const walk = (node: JSONContent): string => {
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.content)) return node.content.map(walk).join("");
    return "";
  };

  return walk(doc).trim();
}
