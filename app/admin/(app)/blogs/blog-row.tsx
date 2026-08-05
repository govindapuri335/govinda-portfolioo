"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { Post } from "@/db/schema";

interface Props {
  post: Post;
}

export function BlogRow({ post }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | "publish" | "feature" | "delete">(
    null
  );

  async function patch(body: Record<string, unknown>, kind: typeof busy) {
    setBusy(kind);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || "Update failed");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || "Delete failed");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null || pending;
  const dateLabel = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <Link
            href={`/admin/blogs/${post.id}/edit`}
            className="font-medium hover:text-primary"
          >
            {post.title}
          </Link>
          <span className="text-xs text-muted-foreground">/{post.slug}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => patch({ published: !post.published }, "publish")}
          className={
            post.published
              ? "inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 disabled:opacity-50"
              : "inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground disabled:opacity-50"
          }
        >
          {busy === "publish" ? "..." : post.published ? "Published" : "Draft"}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => patch({ featured: !post.featured }, "feature")}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {busy === "feature" ? "..." : post.featured ? "★ Featured" : "☆"}
        </button>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{dateLabel}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/blogs/${post.id}/edit`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Edit
          </Link>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onDelete}
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
          >
            {busy === "delete" ? "..." : "Delete"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
