"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AboutPage } from "@/db/schema";

interface Props {
  initial: AboutPage;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function AboutForm({ initial }: Props) {
  const router = useRouter();

  const [introParagraphs, setIntroParagraphs] = useState<string[]>(
    initial.introParagraphs.length > 0 ? initial.introParagraphs : [""]
  );
  const [communityTitle, setCommunityTitle] = useState(initial.communityTitle);
  const [communityItems, setCommunityItems] = useState<string[]>(
    initial.communityItems.length > 0 ? initial.communityItems : [""]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function save() {
    setError(null);

    const cleanedParagraphs = introParagraphs
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const cleanedItems = communityItems
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const cleanedTitle = communityTitle.trim();

    if (cleanedParagraphs.length === 0) {
      setError("Add at least one intro paragraph.");
      return;
    }
    if (!cleanedTitle) {
      setError("Community section title is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          introParagraphs: cleanedParagraphs,
          communityTitle: cleanedTitle,
          communityItems: cleanedItems,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Save failed");
        return;
      }
      const data = await res.json();
      setIntroParagraphs(
        data.about.introParagraphs.length > 0
          ? data.about.introParagraphs
          : [""]
      );
      setCommunityTitle(data.about.communityTitle);
      setCommunityItems(
        data.about.communityItems.length > 0 ? data.about.communityItems : [""]
      );
      setSavedAt(new Date());
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-8">
        {/* Section 1: intro paragraphs */}
        <section className="space-y-3 rounded-md border border-border p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-lg">About paragraphs</h2>
              <p className="text-xs text-muted-foreground">
                Section 1 on the public /about page. Each entry renders as its
                own paragraph.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIntroParagraphs((p) => [...p, ""])}
            >
              + Add paragraph
            </Button>
          </div>

          <div className="space-y-3">
            {introParagraphs.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Paragraph {i + 1}
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIntroParagraphs((cur) => move(cur, i, i - 1))
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
                        setIntroParagraphs((cur) => move(cur, i, i + 1))
                      }
                      disabled={i === introParagraphs.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIntroParagraphs((cur) =>
                          cur.length > 1
                            ? cur.filter((_, idx) => idx !== i)
                            : cur
                        )
                      }
                      disabled={introParagraphs.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={p}
                  onChange={(e) =>
                    setIntroParagraphs((cur) =>
                      cur.map((val, idx) => (idx === i ? e.target.value : val))
                    )
                  }
                  rows={4}
                  placeholder="Write a paragraph about yourself…"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: community involvement */}
        <section className="space-y-3 rounded-md border border-border p-4 sm:p-5">
          <div>
            <h2 className="font-heading text-lg">Community involvement</h2>
            <p className="text-xs text-muted-foreground">
              Section 2 on the public /about page. Heading + bullet list.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="community-title" className="text-sm font-medium">
              Section heading
            </label>
            <Input
              id="community-title"
              value={communityTitle}
              onChange={(e) => setCommunityTitle(e.target.value)}
              placeholder="Community Involvement"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Bullet points</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommunityItems((cur) => [...cur, ""])}
            >
              + Add bullet
            </Button>
          </div>

          <div className="space-y-3">
            {communityItems.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Bullet {i + 1}
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCommunityItems((cur) => move(cur, i, i - 1))
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
                        setCommunityItems((cur) => move(cur, i, i + 1))
                      }
                      disabled={i === communityItems.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCommunityItems((cur) =>
                          cur.length > 1
                            ? cur.filter((_, idx) => idx !== i)
                            : cur
                        )
                      }
                      disabled={communityItems.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={item}
                  onChange={(e) =>
                    setCommunityItems((cur) =>
                      cur.map((val, idx) => (idx === i ? e.target.value : val))
                    )
                  }
                  rows={2}
                  placeholder="e.g. Ran the NYC Half Marathon for Team for Kids…"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-md border border-border p-4 space-y-3">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
          {savedAt && !error && (
            <p className="text-xs text-muted-foreground">
              Saved {savedAt.toLocaleTimeString()}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Changes go live on /about immediately after saving.
          </p>
        </div>
      </aside>
    </div>
  );
}
