import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/session";

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
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-heading text-lg">
              Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/admin/blogs" className="hover:text-foreground">
                Blogs
              </Link>
              <Link href="/admin/about" className="hover:text-foreground">
                About
              </Link>
              <Link href="/admin/skills" className="hover:text-foreground">
                Skills
              </Link>
              <Link
                href="/admin/experience"
                className="hover:text-foreground"
              >
                Experience
              </Link>
              <Link
                href="/admin/learning"
                className="hover:text-foreground"
              >
                Learning
              </Link>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                View site ↗
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
