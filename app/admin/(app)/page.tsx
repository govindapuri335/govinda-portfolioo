import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { listCertificates } from "@/lib/admin/certificates";
import { listExperiences } from "@/lib/admin/experience";
import { listAllPosts } from "@/lib/admin/posts";
import { listSkills } from "@/lib/admin/skills";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  // Cheap counts to show at-a-glance stats. Falls back gracefully if the DB
  // is unreachable so the dashboard still renders.
  let totalBlogs = 0;
  let publishedBlogs = 0;
  let draftBlogs = 0;
  try {
    const all = await listAllPosts();
    totalBlogs = all.length;
    publishedBlogs = all.filter((p) => p.published).length;
    draftBlogs = totalBlogs - publishedBlogs;
  } catch {
    // ignore — counts stay at 0
  }

  let totalSkills = 0;
  try {
    const s = await listSkills();
    totalSkills = s.length;
  } catch {
    // ignore
  }

  let totalExperiences = 0;
  let totalCertificates = 0;
  try {
    const [exp, certs] = await Promise.all([
      listExperiences(),
      listCertificates(),
    ]);
    totalExperiences = exp.length;
    totalCertificates = certs.length;
  } catch {
    // ignore
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage site content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/blogs" className="group">
          <Card className="h-full border bg-background transition-colors group-hover:border-primary/60">
            <CardContent className="py-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg">Blogs</h2>
                  <p className="text-xs text-muted-foreground">
                    Create, edit, publish and feature blog posts.
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground"
                >
                  →
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                <span>
                  <strong className="text-foreground">{totalBlogs}</strong> total
                </span>
                <span>
                  <strong className="text-foreground">{publishedBlogs}</strong>{" "}
                  published
                </span>
                <span>
                  <strong className="text-foreground">{draftBlogs}</strong>{" "}
                  drafts
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/about" className="group">
          <Card className="h-full border bg-background transition-colors group-hover:border-primary/60">
            <CardContent className="py-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg">About page</h2>
                  <p className="text-xs text-muted-foreground">
                    Edit the intro paragraphs and community involvement list on
                    /about.
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground"
                >
                  →
                </span>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                Two editable sections
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/skills" className="group">
          <Card className="h-full border bg-background transition-colors group-hover:border-primary/60">
            <CardContent className="py-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg">Skills</h2>
                  <p className="text-xs text-muted-foreground">
                    Add, edit, and remove the skills shown on /skills and the
                    home page.
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground"
                >
                  →
                </span>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                <strong className="text-foreground">{totalSkills}</strong>{" "}
                {totalSkills === 1 ? "skill" : "skills"}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/learning" className="group">
          <Card className="h-full border bg-background transition-colors group-hover:border-primary/60">
            <CardContent className="py-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg">
                    Certifications &amp; Learning
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Edit the &quot;Current Focus&quot; and &quot;Certifications
                    &amp; Tools&quot; cards shown on /experience and the home
                    page.
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground"
                >
                  →
                </span>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                Two editable sections
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/experience" className="group">
          <Card className="h-full border bg-background transition-colors group-hover:border-primary/60">
            <CardContent className="py-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-lg">Experience</h2>
                  <p className="text-xs text-muted-foreground">
                    Manage roles on /experience and upload certificates for the
                    carousel.
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-muted-foreground group-hover:text-foreground"
                >
                  →
                </span>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">
                    {totalExperiences}
                  </strong>{" "}
                  {totalExperiences === 1 ? "role" : "roles"}
                </span>
                <span>
                  <strong className="text-foreground">
                    {totalCertificates}
                  </strong>{" "}
                  {totalCertificates === 1 ? "certificate" : "certificates"}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
