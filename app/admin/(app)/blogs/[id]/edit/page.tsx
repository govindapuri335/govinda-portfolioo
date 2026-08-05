import Link from "next/link";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { getPostById } from "@/lib/admin/posts";

export const metadata = { title: "Edit blog" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            <Link href="/admin/blogs" className="hover:text-foreground">
              Blogs
            </Link>{" "}
            / Edit
          </div>
          <h1 className="font-heading text-2xl">Edit blog</h1>
        </div>
        {post.published && (
          <Link
            href={`/blogs/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View live ↗
          </Link>
        )}
      </div>
      <PostForm mode="edit" initial={post} />
    </div>
  );
}
