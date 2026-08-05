"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AdminContactRow {
  id: number;
  name: string;
  email: string;
  message: string;
  socials: { platform: string; value: string }[];
  read: boolean;
  ip: string | null;
  userAgent: string | null;
  createdAt: string; // ISO from server
}

type FilterMode = "all" | "unread" | "read";

interface Props {
  initial: AdminContactRow[];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/**
 * Client-side admin UI for contact submissions. Keeps a local copy of the
 * rows so mark-read / delete feel instant, while server actions still hit
 * `/api/admin/contacts/[id]` for durable state.
 */
export function ContactsList({ initial }: Props) {
  const [rows, setRows] = useState<AdminContactRow[]>(initial);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<FilterMode>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "unread") return rows.filter((r) => !r.read);
    return rows.filter((r) => r.read);
  }, [rows, filter]);

  const unreadCount = useMemo(() => rows.filter((r) => !r.read).length, [rows]);

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function markRead(id: number, read: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read } : r)));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function del(id: number) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-full border border-border/70 bg-muted/70 p-1 text-sm"
          role="tablist"
          aria-label="Filter contacts"
        >
          {(["all", "unread", "read"] as FilterMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={filter === m}
              onClick={() => setFilter(m)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
              {m === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          {rows.length} total · {unreadCount} unread
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          No messages{filter !== "all" ? ` in "${filter}"` : ""} yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => {
            const isOpen = expanded.has(r.id);
            const isBusy = busyId === r.id;
            return (
              <li
                key={r.id}
                className={cn(
                  "rounded-2xl border bg-background shadow-sm transition-colors",
                  r.read
                    ? "border-border/60"
                    : "border-primary/40 bg-primary/[0.03]"
                )}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!r.read && (
                        <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          New
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {r.name}
                      </span>
                      <a
                        href={`mailto:${r.email}`}
                        className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        {r.email}
                      </a>
                      <span className="text-xs text-muted-foreground">
                        · {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-2 text-sm text-foreground/90",
                        !isOpen && "line-clamp-2"
                      )}
                    >
                      {r.message}
                    </p>

                    {isOpen && r.socials.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Socials
                        </div>
                        <ul className="mt-1 space-y-1 text-sm">
                          {r.socials.map((s, i) => (
                            <li key={i}>
                              <span className="text-muted-foreground">
                                {s.platform || "—"}:
                              </span>{" "}
                              <span className="break-all">{s.value}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isOpen && (r.ip || r.userAgent) && (
                      <div className="mt-3 text-[11px] text-muted-foreground">
                        <div>IP: {r.ip || "—"}</div>
                        <div className="break-all">
                          UA: {r.userAgent || "—"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(r.id)}
                    >
                      {isOpen ? "Collapse" : "Expand"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => markRead(r.id, !r.read)}
                    >
                      {r.read ? "Mark unread" : "Mark read"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => del(r.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
