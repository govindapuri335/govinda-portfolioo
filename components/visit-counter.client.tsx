"use client";
import { Icons } from "@/components/common/icons";
import { useEffect, useState } from "react";

export default function VisitCounter() {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);

  // Server-backed mode: call our own /api/visits endpoint. This keeps
  // API keys server-side (CounterAPI) and lets the server handle persistence.
  async function fetchCount(optimistic = false) {
    if (!optimistic) setLoading(true);
    try {
      const res = await fetch(`/api/visits`, {
        method: optimistic ? "POST" : "GET",
      });
      if (!res.ok) return;
      const json = await res.json();
      const global = Number(json.global ?? 0);
      setCount(global);
      try {
        localStorage.setItem("visits:cached", String(global));
      } catch (_e) {}
      if (optimistic) {
        try {
          localStorage.setItem("visits:lastHitAt", String(Date.now()));
        } catch (_e) {}
      }
    } catch (e) {
      // ignore
    } finally {
      if (!optimistic) setLoading(false);
    }
  }

  useEffect(() => {
    // show cached value immediately if available, then refresh from server (GET)
    try {
      const cached = localStorage.getItem("visits:cached");
      if (cached) setCount(Number(cached));
    } catch (_e) {}

    // use read-only GET on mount to avoid incrementing counts just by viewing
    fetchCount(false);

    // Also attempt to record a visit on mount for more reliable counting.
    // We avoid double-posting by checking a local `visits:lastHitAt` timestamp
    // and only POST if it's older than the client-side dedupe TTL.
    try {
      const last = Number(localStorage.getItem("visits:lastHitAt") || "0");
      const ttlSec = Number(
        process.env.NEXT_PUBLIC_VISITS_DEDUPE_TTL ?? "3600"
      );
      if (Date.now() - last > ttlSec * 1000) {
        // use the same POST helper which updates lastHitAt when optimistic=true
        fetchCount(true);
      }
    } catch (_e) {}
  }, []);

  // Poll the visits API every N seconds if configured (optional)
  useEffect(() => {
    const pollSec = Number(process.env.NEXT_PUBLIC_VISITS_POLL_INTERVAL ?? 0);
    if (!pollSec || pollSec <= 0) return;
    const id = setInterval(() => {
      fetchCount();
    }, pollSec * 1000);
    return () => clearInterval(id);
  }, []);

  // send a hit when the page becomes hidden (user navigates away). Use sendBeacon
  // where available, otherwise use keepalive fetch. This increases chance the
  // visit is recorded even when the user closes the tab quickly.
  useEffect(() => {
    const sendHidden = () => {
      // avoid double-hitting if we recorded a local hit very recently
      try {
        const last = Number(localStorage.getItem("visits:lastHitAt") || "0");
        if (Date.now() - last < 10_000) return; // skip if hit within 10s
      } catch (_e) {}

      const url = `${window.location.origin}/api/visits`;
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url);
        } else {
          fetch(url, { method: "POST", keepalive: true }).catch(() => {});
        }
      } catch (_e) {
        // ignore
      }
    };
    const handler = () => {
      if (document.visibilityState === "hidden") sendHidden();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  return (
    <div
      role="status"
      aria-label="Visited count"
      className="inline-flex items-center bg-muted px-2 sm:px-3 py-0.5 rounded-full text-sm font-medium gap-0 select-none"
    >
      <span className="inline-flex items-center justify-center w-4 h-4">
        {loading ? (
          <Icons.spinner className="w-3 h-3 animate-spin text-primary" />
        ) : (
          <Icons.user className="w-3 h-3 text-primary" />
        )}
      </span>

      <span className="ml-1 text-xs text-muted-foreground">
        {loading ? (
          <>
            <span className="sm:hidden">Welcome</span>
            <span className="hidden sm:inline">Welcome to my page</span>
          </>
        ) : (
          <span>Visited</span>
        )}
      </span>

      <span aria-live="polite" className="font-mono ml-1 text-xs sm:text-sm">
        {loading ? "..." : (count ?? "—")}
      </span>
    </div>
  );
}
