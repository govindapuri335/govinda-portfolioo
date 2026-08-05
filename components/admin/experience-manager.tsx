"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Experience } from "@/db/schema";

interface Props {
  initial: Experience[];
}

interface Draft {
  title: string;
  company: string;
  date: string;
  location: string;
  description: string;
  bullets: string[];
}

const emptyDraft = (): Draft => ({
  title: "",
  company: "",
  date: "",
  location: "",
  description: "",
  bullets: [""],
});

function fromExperience(e: Experience): Draft {
  return {
    title: e.title,
    company: e.company,
    date: e.date,
    location: e.location,
    description: e.description ?? "",
    bullets: e.bullets.length > 0 ? e.bullets : [""],
  };
}

function validate(d: Draft): string | null {
  if (!d.title.trim()) return "Title is required.";
  if (!d.company.trim()) return "Company is required.";
  if (!d.date.trim()) return "Date is required.";
  if (!d.location.trim()) return "Location is required.";
  const cleaned = d.bullets.map((b) => b.trim()).filter(Boolean);
  if (cleaned.length === 0) return "Add at least one bullet.";
  return null;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ExperienceEditor({
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Credit Analyst & Underwriter"
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Company <span className="text-destructive">*</span>
          </label>
          <Input
            value={draft.company}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="e.g. MMP Capital"
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Date <span className="text-destructive">*</span>
          </label>
          <Input
            value={draft.date}
            onChange={(e) => onChange({ date: e.target.value })}
            placeholder="e.g. 03/2024 – Present"
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Location <span className="text-destructive">*</span>
          </label>
          <Input
            value={draft.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. Farmingdale, NY"
            maxLength={200}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description (optional)</label>
        <Textarea
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Short blurb about the company or role."
          rows={2}
          maxLength={1000}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Bullet points <span className="text-destructive">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ bullets: [...draft.bullets, ""] })}
          >
            + Add bullet
          </Button>
        </div>
        <div className="space-y-3">
          {draft.bullets.map((b, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Bullet {i + 1}
                </label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange({ bullets: move(draft.bullets, i, i - 1) })
                    }
                    disabled={i === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange({ bullets: move(draft.bullets, i, i + 1) })
                    }
                    disabled={i === draft.bullets.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange({
                        bullets:
                          draft.bullets.length > 1
                            ? draft.bullets.filter((_, idx) => idx !== i)
                            : draft.bullets,
                      })
                    }
                    disabled={draft.bullets.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <Textarea
                value={b}
                onChange={(e) =>
                  onChange({
                    bullets: draft.bullets.map((val, idx) =>
                      idx === i ? e.target.value : val
                    ),
                  })
                }
                rows={2}
                placeholder="One accomplishment or responsibility…"
                maxLength={2000}
              />
            </div>
          ))}
        </div>
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

export function ExperienceManager({ initial }: Props) {
  const router = useRouter();

  const [items, setItems] = useState<Experience[]>(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  function beginEdit(e: Experience) {
    setEditingId(e.id);
    setEditDraft(fromExperience(e));
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
      const body = {
        title: addDraft.title.trim(),
        company: addDraft.company.trim(),
        date: addDraft.date.trim(),
        location: addDraft.location.trim(),
        description: addDraft.description.trim() || null,
        bullets: addDraft.bullets.map((b) => b.trim()).filter(Boolean),
      };
      const res = await fetch("/api/admin/experience", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setAddError(d?.error || "Create failed");
        return;
      }
      const data = await res.json();
      setItems((cur) => sortItems([...cur, data.experience]));
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
      const body = {
        title: editDraft.title.trim(),
        company: editDraft.company.trim(),
        date: editDraft.date.trim(),
        location: editDraft.location.trim(),
        description: editDraft.description.trim() || null,
        bullets: editDraft.bullets.map((b) => b.trim()).filter(Boolean),
      };
      const res = await fetch(`/api/admin/experience/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setEditError(d?.error || "Save failed");
        return;
      }
      const data = await res.json();
      setItems((cur) =>
        sortItems(cur.map((s) => (s.id === id ? data.experience : s)))
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError("Network error");
    } finally {
      setEditBusy(false);
    }
  }

  async function removeOne(e: Experience) {
    if (!confirm(`Delete "${e.title} @ ${e.company}"? This cannot be undone.`))
      return;
    setDeleting(e.id);
    try {
      const res = await fetch(`/api/admin/experience/${e.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || "Delete failed");
        return;
      }
      setItems((cur) => cur.filter((x) => x.id !== e.id));
      if (editingId === e.id) setEditingId(null);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function reorder(e: Experience, direction: -1 | 1) {
    const idx = items.findIndex((x) => x.id === e.id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= items.length) return;
    const other = items[swapIdx];
    // Optimistically reorder in local state.
    const swapped = items.slice();
    swapped[idx] = { ...e, sortOrder: other.sortOrder };
    swapped[swapIdx] = { ...other, sortOrder: e.sortOrder };
    setItems(sortItems(swapped));

    // Persist. Fire in parallel; ignore errors silently but refresh on done.
    await Promise.all([
      fetch(`/api/admin/experience/${e.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`/api/admin/experience/${other.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sortOrder: e.sortOrder }),
      }),
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg">Add experience</h2>
            <p className="text-xs text-muted-foreground">
              All fields except description are required.
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
              + Add experience
            </Button>
          )}
        </div>
        {addOpen && (
          <div className="border-t border-border p-4">
            <ExperienceEditor
              draft={addDraft}
              onChange={(patch) => setAddDraft((d) => ({ ...d, ...patch }))}
              onSubmit={createOne}
              onCancel={() => {
                setAddOpen(false);
                setAddError(null);
              }}
              submitLabel="Add experience"
              busy={addBusy}
              error={addError}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg">Experiences</h2>
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "role" : "roles"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-border p-8 text-center text-sm text-muted-foreground">
            No experience entries yet. Add your first one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((e, idx) => {
              const isEditing = editingId === e.id;
              const isDeleting = deleting === e.id;
              return (
                <li
                  key={e.id}
                  className="rounded-md border border-border bg-background"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{e.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {e.company} · {e.location}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {e.date}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 shrink-0">
                          {!isEditing && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => reorder(e, -1)}
                                disabled={idx === 0}
                                title="Move up"
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => reorder(e, 1)}
                                disabled={idx === items.length - 1}
                                title="Move down"
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => beginEdit(e)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeOne(e)}
                                disabled={isDeleting}
                                className="text-destructive hover:text-destructive"
                              >
                                {isDeleting ? "..." : "Delete"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {e.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {e.description}
                        </p>
                      )}
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {e.bullets.slice(0, 3).map((b, i) => (
                          <li key={i} className="line-clamp-2">
                            {b}
                          </li>
                        ))}
                        {e.bullets.length > 3 && (
                          <li className="text-xs italic">
                            +{e.bullets.length - 3} more…
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="border-t border-border p-4">
                      <ExperienceEditor
                        draft={editDraft}
                        onChange={(patch) =>
                          setEditDraft((d) => ({ ...d, ...patch }))
                        }
                        onSubmit={() => saveEdit(e.id)}
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

function sortItems(arr: Experience[]): Experience[] {
  return arr.slice().sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}
