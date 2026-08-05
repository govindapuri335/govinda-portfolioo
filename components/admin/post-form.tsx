"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import { BlogEditor, type EditorValue } from "@/components/admin/editor";
import { TagInput } from "@/components/admin/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/db/schema";

function slugifyClient(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateInputValue(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface Props {
  mode: "create" | "edit";
  initial?: Post;
}

export function PostForm({ mode, initial }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [coverImage, setCoverImage] = useState<string | null>(
    initial?.coverImage ?? null
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [date, setDate] = useState(
    initial?.date ? toDateInputValue(initial.date) : toDateInputValue(new Date())
  );
  const [editorValue, setEditorValue] = useState<EditorValue>({
    html: initial?.contentHtml ?? "",
    json: initial?.contentJson ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTitleChange = useCallback(
    (v: string) => {
      setTitle(v);
      if (!slugTouched) setSlug(slugifyClient(v));
    },
    [slugTouched]
  );

  const onEditorChange = useCallback((v: EditorValue) => {
    setEditorValue(v);
  }, []);

  const initialEditorHtml = useMemo(() => initial?.contentHtml ?? "", [initial]);
  const initialEditorJson = useMemo(
    () => initial?.contentJson ?? null,
    [initial]
  );

  async function submit(nextPublished?: boolean) {
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);

    const isoDate = new Date(`${date}T12:00:00Z`).toISOString();
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      contentHtml: editorValue.html,
      contentJson: editorValue.json || null,
      coverImage: coverImage,
      tags,
      featured,
      published: nextPublished ?? published,
      date: isoDate,
    };

    try {
      const url =
        mode === "create"
          ? "/api/admin/posts"
          : `/api/admin/posts/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Save failed");
        return;
      }
      const data = await res.json();
      if (mode === "create") {
        router.replace(`/admin/blogs/${data.post.id}/edit`);
      } else {
        setPublished(data.post.published);
        setSlug(data.post.slug);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Post title"
            className="text-lg h-12"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary shown on cards and in OG previews"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <BlogEditor
            initialHtml={initialEditorHtml}
            initialJson={initialEditorJson}
            onChange={onEditorChange}
          />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-md border border-border p-4 space-y-3">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => submit()}
              disabled={saving}
              className="w-full"
            >
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Save"
                  : published
                    ? "Update"
                    : "Save draft"}
            </Button>
            {!published && (
              <Button
                type="button"
                variant="outline"
                onClick={() => submit(true)}
                disabled={saving}
                className="w-full"
              >
                Save & publish
              </Button>
            )}
            {published && (
              <Button
                type="button"
                variant="outline"
                onClick={() => submit(false)}
                disabled={saving}
                className="w-full"
              >
                Unpublish
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Status:{" "}
            <span
              className={
                published ? "text-primary font-medium" : "text-muted-foreground"
              }
            >
              {published ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-border p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugifyClient(e.target.value));
              }}
              placeholder="my-post-slug"
            />
            <p className="text-xs text-muted-foreground">/blogs/{slug || "…"}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <TagInput value={tags} onChange={setTags} />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Featured (shown on home page)
          </label>
        </div>

        <div className="rounded-md border border-border p-4">
          <CoverImagePicker value={coverImage} onChange={setCoverImage} />
        </div>
      </aside>
    </div>
  );
}
