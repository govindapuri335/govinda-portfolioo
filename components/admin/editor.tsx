"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { uploadImageToCloudinary } from "@/lib/upload-client";

const lowlight = createLowlight(common);

export interface EditorValue {
  html: string;
  json: string;
}

interface Props {
  initialHtml?: string;
  initialJson?: string | null;
  onChange: (value: EditorValue) => void;
  placeholder?: string;
}

export function BlogEditor({
  initialHtml = "",
  initialJson,
  onChange,
  placeholder = "Start writing your post...",
}: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    // App Router: avoid SSR hydration mismatches by rendering only on the client.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // We use the CodeBlockLowlight extension instead of the built-in one.
        codeBlock: false,
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-md" },
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialJson
      ? safeJson(initialJson) || initialHtml || ""
      : initialHtml || "",
    editorProps: {
      attributes: {
        class: cn(
          "blog-content min-h-[400px] max-w-none px-4 py-6",
          "focus:outline-none"
        ),
      },
    },
    onUpdate({ editor }) {
      onChangeRef.current({
        html: editor.getHTML(),
        json: JSON.stringify(editor.getJSON()),
      });
    },
  });

  // Emit initial value once so the parent has canonical HTML on first render.
  useEffect(() => {
    if (!editor) return;
    onChangeRef.current({
      html: editor.getHTML(),
      json: JSON.stringify(editor.getJSON()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-md border border-border bg-muted/30 h-[500px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-md border border-border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function safeJson(raw: string): object | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL (leave empty to remove)", previous ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const insertImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const uploaded = await uploadImageToCloudinary(file);
        editor
          .chain()
          .focus()
          .setImage({ src: uploaded.url, alt: file.name })
          .run();
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Failed to upload image"
        );
      }
    };
    input.click();
  }, [editor]);

  const Btn = ({
    onClick,
    active,
    title,
    children,
    disabled,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {children}
    </button>
  );

  const Sep = () => <span className="mx-1 h-5 w-px bg-border" />;

  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background/95 backdrop-blur px-2 py-1.5">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <Code className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code block"
      >
        <Code2 className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn onClick={setLink} active={editor.isActive("link")} title="Link">
        <Link2 className="h-4 w-4" />
      </Btn>
      <Btn onClick={insertImage} title="Insert image">
        <ImageIcon className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Btn>
    </div>
  );
}
