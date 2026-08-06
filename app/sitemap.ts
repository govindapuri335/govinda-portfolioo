import { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getAllBlogsMeta } from "@/lib/blogs";

// Render on-demand so a slow/unreachable DB at build time doesn't break the
// deploy. Cached briefly at the edge.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Main pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Blog post pages — each gets its own sitemap entry with correct date.
  // If the DB is unreachable, return the static routes instead of failing.
  let blogs: Awaited<ReturnType<typeof getAllBlogsMeta>> = [];
  try {
    blogs = await getAllBlogsMeta();
  } catch (err) {
    console.error("[sitemap] getAllBlogsMeta failed:", err);
  }
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.date),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes];
}
