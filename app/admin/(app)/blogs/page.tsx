import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { listAllPosts, type PostStatusFilter } from "@/lib/admin/posts";
import { cn } from "@/lib/utils";

import { BlogRow } from "./blog-row";

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export const metadata = { title: "Blogs" };

function normalizeStatus(v: string | undefined): PostStatusFilter {
  return v === "published" || v === "draft" ? v : "all";
}

export default async function AdminBlogsPage({ searchParams }: Props) {
  const { q, status: rawStatus } = await searchParams;
  const status = normalizeStatus(rawStatus);
  const rows = await listAllPosts({ search: q, status });

  const filters: { key: PostStatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl mb-1">Blogs</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "blog" : "blogs"}
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          New blog
        </Link>
      </div>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-center gap-2"
        action="/admin/blogs"
      >
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search title, slug, description..."
          className="flex h-9 min-w-[220px] flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center gap-1 rounded-md border border-border p-1">
          {filters.map((f) => {
            const isActive = status === f.key;
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (f.key !== "all") params.set("status", f.key);
            const href = `/admin/blogs${params.toString() ? `?${params.toString()}` : ""}`;
            return (
              <Link
                key={f.key}
                href={href}
                className={cn(
                  "px-2.5 py-1 rounded-sm text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-border">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No blogs found.{" "}
            <Link href="/admin/blogs/new" className="text-primary underline">
              Create the first one
            </Link>
            .
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <BlogRow key={r.id} post={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
