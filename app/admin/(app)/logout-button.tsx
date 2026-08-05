"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={loading}
      aria-label="Sign out"
      className="h-8 shrink-0 whitespace-nowrap rounded-full px-2.5 text-[11px] xs:h-9 sm:px-4 sm:text-sm"
    >
      {loading ? (
        <>
          <span className="sm:hidden">...</span>
          <span className="hidden sm:inline">Signing out...</span>
        </>
      ) : (
        <>
          <span className="xs:hidden">Exit</span>
          <span className="hidden xs:inline">Sign out</span>
        </>
      )}
    </Button>
  );
}
