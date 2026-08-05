"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Certificate } from "@/db/schema";
import { uploadImageToCloudinary } from "@/lib/upload-client";

interface Props {
  initial: Certificate[];
}

interface Draft {
  title: string;
  issuer: string;
  date: string;
  imageUrl: string;
}

const emptyDraft = (): Draft => ({
  title: "",
  issuer: "",
  date: "",
  imageUrl: "",
});

function fromCertificate(c: Certificate): Draft {
  return {
    title: c.title,
    issuer: c.issuer,
    date: c.date,
    imageUrl: c.imageUrl,
  };
}

function validate(d: Draft): string | null {
  if (!d.title.trim()) return "Title is required.";
  if (!d.imageUrl.trim()) return "Certificate image is required.";
  try {
    new URL(d.imageUrl);
  } catch {
    return "Image URL is invalid.";
  }
  return null;
}

function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      try {
        const uploaded = await uploadImageToCloudinary(file);
        onChange(uploaded.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Certificate image <span className="text-destructive">*</span>
      </label>
      {value ? (
        <div className="relative w-full max-w-md aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={value}
            alt="Certificate"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-contain"
            unoptimized={!value.includes("res.cloudinary.com")}
          />
        </div>
      ) : (
        <div className="w-full max-w-md aspect-[4/3] rounded-md border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
          No image
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            disabled={uploading}
          >
            Remove
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function CertificateEditor({
  draft,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
  error,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  busy: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-4 rounded-md border border-border p-4 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. Credit Risk Analysis & Underwriting"
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Issuer (optional)</label>
            <Input
              value={draft.issuer}
              onChange={(e) => onChange({ issuer: e.target.value })}
              placeholder="e.g. Coursera & Starweaver"
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date (optional)</label>
            <Input
              value={draft.date}
              onChange={(e) => onChange({ date: e.target.value })}
              placeholder="e.g. 2025"
              maxLength={100}
            />
          </div>
        </div>
        <ImagePicker
          value={draft.imageUrl}
          onChange={(url) => onChange({ imageUrl: url })}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="button" onClick={onSubmit} disabled={busy}>
          {busy ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function CertificatesManager({ initial }: Props) {
  const router = useRouter();

  const [items, setItems] = useState<Certificate[]>(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  function beginEdit(c: Certificate) {
    setEditingId(c.id);
    setEditDraft(fromCertificate(c));
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function createOne() {
    setAddError(null);
    const err = validate(addDraft);
    if (err) {
      setAddError(err);
      return;
    }
    setAddBusy(true);
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: addDraft.title.trim(),
          issuer: addDraft.issuer.trim(),
          date: addDraft.date.trim(),
          imageUrl: addDraft.imageUrl.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setAddError(d?.error || "Create failed");
        return;
      }
      const data = await res.json();
      setItems((cur) => sortItems([...cur, data.certificate]));
      setAddDraft(emptyDraft());
      setAddOpen(false);
      router.refresh();
    } catch {
      setAddError("Network error");
    } finally {
      setAddBusy(false);
    }
  }

  async function saveEdit(id: number) {
    setEditError(null);
    const err = validate(editDraft);
    if (err) {
      setEditError(err);
      return;
    }
    setEditBusy(true);
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: editDraft.title.trim(),
          issuer: editDraft.issuer.trim(),
          date: editDraft.date.trim(),
          imageUrl: editDraft.imageUrl.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setEditError(d?.error || "Save failed");
        return;
      }
      const data = await res.json();
      setItems((cur) =>
        sortItems(cur.map((s) => (s.id === id ? data.certificate : s)))
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError("Network error");
    } finally {
      setEditBusy(false);
    }
  }

  async function removeOne(c: Certificate) {
    if (!confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    setDeleting(c.id);
    try {
      const res = await fetch(`/api/admin/certificates/${c.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || "Delete failed");
        return;
      }
      setItems((cur) => cur.filter((x) => x.id !== c.id));
      if (editingId === c.id) setEditingId(null);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function reorder(c: Certificate, direction: -1 | 1) {
    const idx = items.findIndex((x) => x.id === c.id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    const swapped = items.slice();
    swapped[idx] = { ...c, sortOrder: other.sortOrder };
    swapped[swapIdx] = { ...other, sortOrder: c.sortOrder };
    setItems(sortItems(swapped));
    await Promise.all([
      fetch(`/api/admin/certificates/${c.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`/api/admin/certificates/${other.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sortOrder: c.sortOrder }),
      }),
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg">Add certificate</h2>
            <p className="text-xs text-muted-foreground">
              Uploaded images appear in the /experience carousel.
            </p>
          </div>
          {!addOpen && (
            <Button
              type="button"
              onClick={() => {
                setAddDraft(emptyDraft());
                setAddError(null);
                setAddOpen(true);
              }}
            >
              + Add certificate
            </Button>
          )}
        </div>
        {addOpen && (
          <div className="border-t border-border p-4">
            <CertificateEditor
              draft={addDraft}
              onChange={(patch) => setAddDraft((d) => ({ ...d, ...patch }))}
              onSubmit={createOne}
              onCancel={() => {
                setAddOpen(false);
                setAddError(null);
              }}
              submitLabel="Add certificate"
              busy={addBusy}
              error={addError}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg">Certificates</h2>
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "certificate" : "certificates"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-border p-8 text-center text-sm text-muted-foreground">
            No certificates yet. Add your first one above.
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((c, idx) => {
              const isEditing = editingId === c.id;
              const isDeleting = deleting === c.id;
              return (
                <li
                  key={c.id}
                  className="rounded-md border border-border bg-background overflow-hidden"
                >
                  <div className="relative w-full aspect-[4/3] bg-muted">
                    <Image
                      src={c.imageUrl}
                      alt={c.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-contain"
                      unoptimized={!c.imageUrl.includes("res.cloudinary.com")}
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{c.title}</h3>
                      {(c.issuer || c.date) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {[c.issuer, c.date].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      {!isEditing && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => reorder(c, -1)}
                            disabled={idx === 0}
                            title="Move earlier"
                          >
                            ←
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => reorder(c, 1)}
                            disabled={idx === items.length - 1}
                            title="Move later"
                          >
                            →
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => beginEdit(c)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeOne(c)}
                            disabled={isDeleting}
                            className="text-destructive hover:text-destructive"
                          >
                            {isDeleting ? "..." : "Delete"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="border-t border-border p-3">
                      <CertificateEditor
                        draft={editDraft}
                        onChange={(patch) =>
                          setEditDraft((d) => ({ ...d, ...patch }))
                        }
                        onSubmit={() => saveEdit(c.id)}
                        onCancel={cancelEdit}
                        submitLabel="Save changes"
                        busy={editBusy}
                        error={editError}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function sortItems(arr: Certificate[]): Certificate[] {
  return arr.slice().sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}
