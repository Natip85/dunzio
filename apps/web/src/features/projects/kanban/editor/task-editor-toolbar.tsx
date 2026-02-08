"use client";

import type { Editor } from "@tiptap/react";
import { useState } from "react";
import {
  Bold,
  Highlighter,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Strikethrough,
  TypeIcon,
  Underline,
  Undo,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

export type TaskEditorState = {
  isBold?: boolean;
  canBold?: boolean;
  isItalic?: boolean;
  canItalic?: boolean;
  isUnderline?: boolean;
  canUnderline?: boolean;
  isStrike?: boolean;
  canStrike?: boolean;
  isCode?: boolean;
  canCode?: boolean;
  isHighlight?: boolean;
  canHighlight?: boolean;
  isLink?: boolean;
  linkUrl?: string;
  currentColor?: string;
  isHeading1?: boolean;
  isHeading2?: boolean;
  isHeading3?: boolean;
  isParagraph?: boolean;
  isBulletList?: boolean;
  isOrderedList?: boolean;
  isCodeBlock?: boolean;
  isBlockquote?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
};

const TEXT_COLORS = [
  { name: "Default", color: undefined },
  { name: "Gray", color: "#6b7280" },
  { name: "Red", color: "#ef4444" },
  { name: "Orange", color: "#f97316" },
  { name: "Yellow", color: "#eab308" },
  { name: "Green", color: "#22c55e" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#a855f7" },
  { name: "Pink", color: "#ec4899" },
];

type TaskEditorToolbarProps = {
  editor: Editor | null;
  editorState: TaskEditorState;
};

export function TaskEditorToolbar({ editor, editorState }: TaskEditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleLinkToggle = () => {
    if (!editor) return;

    if (editorState.isLink) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      setLinkUrl("");
      return;
    }

    setLinkUrl(editorState.linkUrl ?? "");
    setShowLinkInput(true);
  };

  const handleSetLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const handleSetColor = (color: string | undefined) => {
    if (!editor) return;
    if (color) editor.chain().focus().setColor(color).run();
    else editor.chain().focus().unsetColor().run();
    setShowColorPicker(false);
  };

  return (
    <div className="bg-muted/50 flex min-h-11 w-full items-center gap-1.5 overflow-x-auto rounded-md border px-2 py-1">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 pr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.commands.undo()}
          disabled={!editorState.canUndo}
          className="text-muted-foreground hover:text-foreground hover:bg-accent size-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.commands.redo()}
          disabled={!editorState.canRedo}
          className="text-muted-foreground hover:text-foreground hover:bg-accent size-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-border h-6 w-px" />

      {/* formatting Popover (keeps toolbar compact) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-accent size-8 p-0"
            title="Formatting"
          >
            <TypeIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-78 p-0"
          align="start"
          sideOffset={8}
          onFocusOutside={(e) => e.preventDefault()}
        >
          {/* Mini toolbar */}
          <div className="flex items-center gap-0.5 overflow-x-auto border-b p-2">
            <Toggle
              size="sm"
              pressed={editorState.isBold}
              onPressedChange={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editorState.canBold}
              className="size-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editorState.isItalic}
              onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editorState.canItalic}
              className="size-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editorState.isUnderline}
              onPressedChange={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editorState.canUnderline}
              className="size-8 p-0"
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editorState.isStrike}
              onPressedChange={() => editor?.chain().focus().toggleStrike().run()}
              disabled={!editorState.canStrike}
              className="size-8 p-0"
              title="Strike"
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>

            <div className="bg-border mx-1 h-5 w-px" />

            <Toggle
              size="sm"
              pressed={editorState.isHighlight}
              onPressedChange={() => editor?.chain().focus().toggleHighlight().run()}
              disabled={!editorState.canHighlight}
              className="size-8 p-0"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>

            {/* Color picker toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => setShowColorPicker((v) => !v)}
              title="Text color"
            >
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: editorState.currentColor ?? "currentColor" }}
              />
            </Button>

            <div className="bg-border mx-1 h-5 w-px" />

            <Toggle
              size="sm"
              pressed={editorState.isLink}
              onPressedChange={handleLinkToggle}
              className="size-8 p-0"
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={showImageUpload}
              onPressedChange={() => setShowImageUpload(!showImageUpload)}
              className="size-8 p-0"
            >
              {isUploading ?
                <Loader2 className="h-4 w-4 animate-spin" />
              : <ImageIcon className="h-4 w-4" />}
            </Toggle>
          </div>

          {/* Link input */}
          {showLinkInput && (
            <div className="flex items-center gap-2 border-b p-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSetLink();
                  }
                  if (e.key === "Escape") {
                    setShowLinkInput(false);
                    setLinkUrl("");
                  }
                }}
                className="h-9 flex-1"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={handleSetLink}
                className="h-9"
              >
                {linkUrl.trim() ? "Set" : "Remove"}
              </Button>
            </div>
          )}

          {/* Image Upload */}
          {showImageUpload && (
            <div className="border-b p-2">
              <UploadButton
                endpoint="imageUploader"
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (res?.[0]?.url) {
                    editor?.chain().focus().setImage({ src: res[0].url }).run();
                  }
                  setShowImageUpload(false);
                }}
                onUploadError={() => {
                  setIsUploading(false);
                }}
                appearance={{
                  button:
                    "ut-ready:bg-primary ut-uploading:bg-primary/50 text-primary-foreground text-sm h-8 px-3",
                  allowedContent: "text-muted-foreground text-xs",
                }}
              />
            </div>
          )}
          {/* Color picker */}
          {showColorPicker && (
            <div className="flex flex-wrap gap-1 border-b p-2">
              {TEXT_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  title={item.name}
                  onClick={() => handleSetColor(item.color)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    editorState.currentColor === item.color && "ring-primary ring-2 ring-offset-1"
                  )}
                  style={{
                    backgroundColor: item.color ?? "transparent",
                    borderColor: item.color ? "transparent" : "currentColor",
                  }}
                />
              ))}
            </div>
          )}

          {/* Block options */}
          <div className="grid grid-cols-2 gap-1 p-2">
            <Button
              type="button"
              variant={editorState.isHeading1 ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              H1
            </Button>
            <Button
              type="button"
              variant={editorState.isHeading2 ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </Button>
            <Button
              type="button"
              variant={editorState.isHeading3 ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </Button>
            <Button
              type="button"
              variant={editorState.isParagraph ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().setParagraph().run()}
            >
              Paragraph
            </Button>
            <Button
              type="button"
              variant={editorState.isBulletList ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="mr-2 h-4 w-4" /> Bullets
            </Button>
            <Button
              type="button"
              variant={editorState.isOrderedList ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="mr-2 h-4 w-4" /> Numbers
            </Button>
            <Button
              type="button"
              variant={editorState.isBlockquote ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="mr-2 h-4 w-4" /> Quote
            </Button>
            <Button
              type="button"
              variant={editorState.isCodeBlock ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            >
              Code block
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1" />
    </div>
  );
}
