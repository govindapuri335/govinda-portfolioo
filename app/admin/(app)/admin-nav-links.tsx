"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type AdminNavLinksProps = {
  className?: string;
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/contacts", label: "Contacts" },
];

export function AdminNavLinks({ className }: AdminNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex w-full min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto rounded-full border border-border/70 bg-muted/70 px-1 py-1 shadow-sm snap-x snap-mandatory scroll-px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden xs:gap-1 xs:px-1.5 sm:gap-1.5 sm:px-2 sm:py-1.5 md:gap-2 md:px-2.5 lg:justify-center",
        className
      )}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-none snap-start items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors xs:px-3 xs:text-xs sm:px-3.5 sm:py-2 sm:text-sm md:px-4",
              isActive
                ? "bg-[#2f2f2f] text-white shadow-sm dark:bg-white dark:text-[#2f2f2f]"
                : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
