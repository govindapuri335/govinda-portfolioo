"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LearningPage } from "@/db/schema";

interface Props {
  initial: LearningPage;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function LearningForm({ initial }: Props) {
  const router = useRouter();

  const [currentFocusTitle, setCurrentFocusTitle] = useState(
    initial.currentFocusTitle
  );
  const [currentFocusBullets, setCurrentFocusBullets] = useState<string[]>(
    initial.currentFocusBullets.length > 0 ? initial.currentFocusBullets : [""]
  );
  const [certificationsTitle, setCertificationsTitle] = useState(
    initial.certificationsTitle
  );
  const [certificationsBullets, setCertificationsBullets] = useState<string[]>(
    initial.certificationsBullets.length > 0
      ? initial.certificationsBullets
      : [""]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function save() {
    setError(null);

    const cleanedFocusTitle = currentFocusTitle.trim();
    const cleanedFocusBullets = currentFocusBullets
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    const cleanedCertsTitle = certificationsTitle.trim();
    const cleanedCertsBullets = certificationsBullets
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (!cleanedFocusTitle) {
      setError("Current Focus title is required.");
      return;
    }
    if (!cleanedCertsTitle) {
      setError("Certifications & Tools title is required.");
      return;
    }
    if (cleanedFocusBullets.length === 0) {
      setError("Add at least one Current Focus bullet.");
      return;
    }
    if (cleanedCertsBullets.length === 0) {
      setError("Add at least one Certifications & Tools bullet.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/learning", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentFocusTitle: cleanedFocusTitle,
          currentFocusBullets: cleanedFocusBullets,
          certificationsTitle: cleanedCertsTitle,
          certificationsBullets: cleanedCertsBullets,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Save failed");
        return;
      }
      const data = await res.json();
      setCurrentFocusTitle(data.learning.currentFocusTitle);
      setCurrentFocusBullets(
        data.learning.currentFocusBullets.length > 0
          ? data.learning.currentFocusBullets
          : [""]
      );
      setCertificationsTitle(data.learning.certificationsTitle);
      setCertificationsBullets(
        data.learning.certificationsBullets.length > 0
          ? data.learning.certificationsBullets
          : [""]
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
        {/* Section 1: Current Focus */}
        <section className="space-y-3 rounded-md border border-border p-4 sm:p-5">
          <div>
            <h2 className="font-heading text-lg">Current Focus</h2>
            <p className="text-xs text-muted-foreground">
              Left card in the Certifications &amp; Learning section. Heading +
              bullet list.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="current-focus-title"
              className="text-sm font-medium"
            >
              Section heading
            </label>
            <Input
              id="current-focus-title"
              value={currentFocusTitle}
              onChange={(e) => setCurrentFocusTitle(e.target.value)}
              placeholder="Current Focus"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Bullet points</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentFocusBullets((cur) => [...cur, ""])}
            >
              + Add bullet
            </Button>
          </div>

          <div className="space-y-3">
            {currentFocusBullets.map((item, i) => (
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
                        setCurrentFocusBullets((cur) => move(cur, i, i - 1))
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
                        setCurrentFocusBullets((cur) => move(cur, i, i + 1))
                      }
                      disabled={i === currentFocusBullets.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentFocusBullets((cur) =>
                          cur.length > 1
                            ? cur.filter((_, idx) => idx !== i)
                            : cur
                        )
                      }
                      disabled={currentFocusBullets.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={item}
                  onChange={(e) =>
                    setCurrentFocusBullets((cur) =>
                      cur.map((val, idx) => (idx === i ? e.target.value : val))
                    )
                  }
                  rows={2}
                  placeholder="e.g. CLFP preparation"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Certifications & Tools */}
        <section className="space-y-3 rounded-md border border-border p-4 sm:p-5">
          <div>
            <h2 className="font-heading text-lg">Certifications &amp; Tools</h2>
            <p className="text-xs text-muted-foreground">
              Right card in the Certifications &amp; Learning section. Heading +
              bullet list.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="certifications-title"
              className="text-sm font-medium"
            >
              Section heading
            </label>
            <Input
              id="certifications-title"
              value={certificationsTitle}
              onChange={(e) => setCertificationsTitle(e.target.value)}
              placeholder="Certifications & Tools"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">Bullet points</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCertificationsBullets((cur) => [...cur, ""])}
            >
              + Add bullet
            </Button>
          </div>

          <div className="space-y-3">
            {certificationsBullets.map((item, i) => (
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
                        setCertificationsBullets((cur) => move(cur, i, i - 1))
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
                        setCertificationsBullets((cur) => move(cur, i, i + 1))
                      }
                      disabled={i === certificationsBullets.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCertificationsBullets((cur) =>
                          cur.length > 1
                            ? cur.filter((_, idx) => idx !== i)
                            : cur
                        )
                      }
                      disabled={certificationsBullets.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={item}
                  onChange={(e) =>
                    setCertificationsBullets((cur) =>
                      cur.map((val, idx) => (idx === i ? e.target.value : val))
                    )
                  }
                  rows={2}
                  placeholder="e.g. Certified Lease & Finance Professional (CLFP) — Candidate…"
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
            Changes go live on the home page and /experience immediately after
            saving.
          </p>
        </div>
      </aside>
    </div>
  );
}
