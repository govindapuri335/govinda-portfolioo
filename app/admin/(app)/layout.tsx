import Link from "next/link";
import { redirect } from "next/navigation";

import { Icons } from "@/components/common/icons";
import { ModeToggle } from "@/components/common/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { isAuthenticated } from "@/lib/session";
import { cn } from "@/lib/utils";

import { AdminNavLinks } from "./admin-nav-links";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        {/* Override the global .container 2rem padding on small screens so the nav has real breathing room on 320-480px devices. */}
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-1.5 px-2.5 py-2 xs:gap-2 xs:px-4 xs:py-2.5 sm:px-6 sm:py-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-4 lg:px-8 lg:py-4">
          {/* Top row on mobile/tablet: brand + actions. On desktop this is the left column. */}
          <div className="flex items-center justify-between gap-1 xs:gap-1.5 sm:gap-2 lg:justify-start">
            <Link
              href="/admin"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background px-2.5 font-heading text-[11px] font-semibold shadow-sm xs:h-9 xs:text-xs sm:px-3 sm:text-sm"
            >
              Admin
            </Link>
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 lg:hidden">
              <Link
                href={siteConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View site"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 w-8 shrink-0 rounded-full p-0 text-[11px] xs:h-9 sm:w-auto sm:px-3 sm:text-xs"
                )}
              >
                <Icons.externalLink className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">View site</span>
              </Link>
              <ModeToggle />
              <LogoutButton />
            </div>
          </div>

          {/* Nav pills: full width row on mobile/tablet, middle column on desktop. */}
          <AdminNavLinks className="w-full lg:min-w-0 lg:flex-1" />

          {/* Desktop-only actions cluster (right column). */}
          <div className="hidden shrink-0 items-center gap-2 justify-self-end lg:flex">
            <Link
              href={siteConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0 rounded-full px-4 text-sm"
              )}
            >
              <Icons.externalLink className="mr-1 h-3.5 w-3.5" />
              View site
            </Link>
            <ModeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-2.5 py-5 xs:px-4 xs:py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
