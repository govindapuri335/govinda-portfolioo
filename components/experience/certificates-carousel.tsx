"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Certificate } from "@/db/schema";
import { cn } from "@/lib/utils";

interface Props {
  certificates: Certificate[];
  /** Milliseconds between automatic slides. */
  intervalMs?: number;
}

/**
 * Auto-advancing certificate slider with manual prev/next controls and dots.
 *
 * - Slides advance every `intervalMs` (default 5000ms).
 * - Auto-advance pauses on hover / focus and when the tab is hidden.
 * - Prev/Next buttons and dot indicators support manual navigation.
 * - Transitions between slides use a CSS transform on a horizontal track so
 *   the movement is smooth ("slides slowly") rather than an abrupt swap.
 */
export function CertificatesCarousel({
  certificates,
  intervalMs = 5000,
}: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = certificates.length;
  const rootRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback(
    (n: number) => {
      if (count === 0) return;
      const next = ((n % count) + count) % count;
      setIndex(next);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance, respecting hover/focus pause and tab visibility.
  useEffect(() => {
    if (count <= 1) return;
    if (paused) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % count);
      }
    }, intervalMs);
    return () => clearInterval(t);
  }, [count, intervalMs, paused]);

  // Keyboard navigation when the carousel has focus.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      className="relative w-full mx-auto max-w-4xl outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Certificates"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live="polite"
        >
          {certificates.map((c, i) => (
            <div
              key={c.id}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${c.title}`}
            >
              <div className="relative w-full aspect-[16/10] bg-muted">
                <Image
                  src={c.imageUrl}
                  alt={c.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-contain"
                  priority={i === 0}
                  unoptimized={!c.imageUrl.includes("res.cloudinary.com")}
                />
              </div>
              <div className="p-4 border-t border-border">
                <h3 className="font-heading text-lg leading-snug">{c.title}</h3>
                {(c.issuer || c.date) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {[c.issuer, c.date].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous certificate"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 backdrop-blur"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next certificate"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/80 backdrop-blur"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {certificates.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Go to certificate ${i + 1}: ${c.title}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
