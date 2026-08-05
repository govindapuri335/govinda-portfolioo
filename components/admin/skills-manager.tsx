"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Rating from "@/components/skills/rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Skill } from "@/db/schema";
import {
  DEFAULT_SKILL_ICON_KEY,
  SKILL_ICON_KEYS,
  getIcon,
  type SkillIconKey,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Props {
  initial: Skill[];
}

interface Draft {
  name: string;
  description: string;
  rating: number;
  iconKey: string;
}

const emptyDraft = (): Draft => ({
  name: "",
  description: "",
  rating: 5,
  iconKey: DEFAULT_SKILL_ICON_KEY,
});

/** Validate a draft. Returns null if OK, else an error message. */
function validate(d: Draft): string | null {
  if (!d.name.trim()) return "Name is required.";
  if (!d.description.trim()) return "Description is required.";
  if (!Number.isInteger(d.rating) || d.rating < 1 || d.rating > 5)
    return "Rating must be between 1 and 5.";
  if (!d.iconKey || !SKILL_ICON_KEYS.includes(d.iconKey as SkillIconKey))
    return "Please pick an icon.";
  return null;
}

/** Interactive 1-5 star picker. */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHover(null)}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= display;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <svg
              className={cn(
                "w-6 h-6 transition-colors",
                active ? "text-yellow-300" : "text-muted"
              )}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
          </button>
        );
      })}
      <span className="ml-2 text-xs text-muted-foreground">{display}/5</span>
    </div>
  );
}

/** Grid of every available icon; selected one gets an accent border. */
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SKILL_ICON_KEYS;
    return SKILL_ICON_KEYS.filter((k) => k.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter icons…"
        className="h-8"
      />
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto rounded-md border border-border p-2 bg-background">
        {filtered.map((key) => {
          const Icon = getIcon(key);
          const selected = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              title={key}
              aria-label={key}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md border p-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-foreground"
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] leading-none truncate w-full text-center text-muted-foreground">
                {key}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-muted-foreground">
            No icons match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

/** Editor block reused for both the "Add new" panel and inline edit. */
function SkillEditor({
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
  const Preview = getIcon(draft.iconKey);
  return (
    <div className="space-y-4 rounded-md border border-border p-4 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Credit Analysis"
              maxLength={120}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Short description <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="One-sentence summary of the skill."
              rows={3}
              maxLength={500}
            />
            <p className="text-[11px] text-muted-foreground">
              {draft.description.length}/500
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Rating <span className="text-destructive">*</span>
            </label>
            <StarPicker
              value={draft.rating}
              onChange={(n) => onChange({ rating: n })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Icon <span className="text-destructive">*</span>
          </label>
          <div className="flex items-center gap-3 rounded-md border border-border p-3 bg-muted/30">
            <Preview size={36} />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Selected</p>
              <p className="text-sm font-medium truncate">{draft.iconKey}</p>
            </div>
          </div>
          <IconPicker
            value={draft.iconKey}
            onChange={(key) => onChange({ iconKey: key })}
          />
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

export function SkillsManager({ initial }: Props) {
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<Draft>(emptyDraft);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<number | null>(null);

  function beginEdit(s: Skill) {
    setEditingId(s.id);
    setEditDraft({
      name: s.name,
      description: s.description,
      rating: s.rating,
      iconKey: s.iconKey,
    });
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
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: addDraft.name.trim(),
          description: addDraft.description.trim(),
          rating: addDraft.rating,
          iconKey: addDraft.iconKey,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setAddError(d?.error || "Create failed");
        return;
      }
      const data = await res.json();
      setSkills((cur) => sortSkills([...cur, data.skill]));
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
      const res = await fetch(`/api/admin/skills/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: editDraft.name.trim(),
          description: editDraft.description.trim(),
          rating: editDraft.rating,
          iconKey: editDraft.iconKey,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setEditError(d?.error || "Save failed");
        return;
      }
      const data = await res.json();
      setSkills((cur) =>
        sortSkills(cur.map((s) => (s.id === id ? data.skill : s)))
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError("Network error");
    } finally {
      setEditBusy(false);
    }
  }

  async function removeOne(s: Skill) {
    if (!confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
    setDeleting(s.id);
    try {
      const res = await fetch(`/api/admin/skills/${s.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d?.error || "Delete failed");
        return;
      }
      setSkills((cur) => cur.filter((x) => x.id !== s.id));
      if (editingId === s.id) setEditingId(null);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new */}
      <div className="rounded-md border border-border">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg">Add a skill</h2>
            <p className="text-xs text-muted-foreground">
              All fields are required.
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
              + Add skill
            </Button>
          )}
        </div>
        {addOpen && (
          <div className="border-t border-border p-4">
            <SkillEditor
              draft={addDraft}
              onChange={(patch) => setAddDraft((d) => ({ ...d, ...patch }))}
              onSubmit={createOne}
              onCancel={() => {
                setAddOpen(false);
                setAddError(null);
              }}
              submitLabel="Add skill"
              busy={addBusy}
              error={addError}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg">Skills</h2>
          <p className="text-xs text-muted-foreground">
            {skills.length} {skills.length === 1 ? "skill" : "skills"}
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-md border border-border p-8 text-center text-sm text-muted-foreground">
            No skills yet. Add your first one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {skills.map((s) => {
              const Icon = getIcon(s.iconKey);
              const isEditing = editingId === s.id;
              const isDeleting = deleting === s.id;
              return (
                <li
                  key={s.id}
                  className="rounded-md border border-border bg-background"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="shrink-0 rounded-md border border-border p-3 bg-muted/30">
                      <Icon size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{s.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {s.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {!isEditing && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => beginEdit(s)}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeOne(s)}
                                disabled={isDeleting}
                                className="text-destructive hover:text-destructive"
                              >
                                {isDeleting ? "..." : "Delete"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <Rating stars={s.rating} />
                        <span>Icon: {s.iconKey}</span>
                      </div>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="border-t border-border p-4">
                      <SkillEditor
                        draft={editDraft}
                        onChange={(patch) =>
                          setEditDraft((d) => ({ ...d, ...patch }))
                        }
                        onSubmit={() => saveEdit(s.id)}
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

/** Same order as the server: rating desc, then id asc as a stable tiebreaker. */
function sortSkills(arr: Skill[]): Skill[] {
  return arr.slice().sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}
