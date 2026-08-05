import Link from "next/link";

import { PostForm } from "@/components/admin/post-form";

export const metadata = { title: "New blog" };

export default function NewBlogPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            <Link href="/admin/blogs" className="hover:text-foreground">
              Blogs
            </Link>{" "}
            / New
          </div>
          <h1 className="font-heading text-2xl">New blog</h1>
        </div>
      </div>
      <PostForm mode="create" />
    </div>
  );
}
