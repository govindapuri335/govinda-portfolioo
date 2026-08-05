import Link from "next/link";

import { Icons } from "@/components/common/icons";
import { Card, CardContent } from "@/components/ui/card";
import { listCertificates } from "@/lib/admin/certificates";
import { getContactCounts } from "@/lib/admin/contacts";
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

  let contactTotal = 0;
  let contactUnread = 0;
  try {
    const counts = await getContactCounts();
    contactTotal = counts.total;
    contactUnread = counts.unread;
  } catch {
    // ignore
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin overview</p>
            <h1 className="font-heading text-2xl md:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage your content quickly from one polished workspace.
            </p>
          </div>
          <div className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
            {totalBlogs} total posts · {publishedBlogs} published
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Link href="/admin/blogs" className="group">
          <Card className="h-full overflow-hidden border border-border/70 bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">
                    Content hub
                  </p>
                  <h2 className="mt-1 font-heading text-xl">Blogs</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create, edit, publish and feature blog posts.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icons.arrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-auto grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-center text-sm">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {totalBlogs}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {publishedBlogs}
                  </div>
                  <div className="text-xs text-muted-foreground">Published</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {draftBlogs}
                  </div>
                  <div className="text-xs text-muted-foreground">Drafts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/about" className="group">
          <Card className="h-full overflow-hidden border border-border/70 bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Profile</p>
                  <h2 className="mt-1 font-heading text-xl">About page</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Update the intro and community section on the public about
                    page.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icons.arrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-auto rounded-xl border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                Two editable sections ready for quick updates.
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/skills" className="group">
          <Card className="h-full overflow-hidden border border-border/70 bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Showcase</p>
                  <h2 className="mt-1 font-heading text-xl">Skills</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add, edit, and remove skills shown on the public skills page
                    and home page.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icons.arrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-auto rounded-xl border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                <strong className="text-foreground">{totalSkills}</strong>{" "}
                {totalSkills === 1 ? "skill" : "skills"} currently available
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/experience" className="group">
          <Card className="h-full overflow-hidden border border-border/70 bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Career</p>
                  <h2 className="mt-1 font-heading text-xl">Experience</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Manage roles, update learning cards, and organize
                    certificates.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icons.arrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-center text-sm">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {totalExperiences}
                  </div>
                  <div className="text-xs text-muted-foreground">Roles</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {totalCertificates}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Certificates
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/contacts" className="group">
          <Card className="h-full overflow-hidden border border-border/70 bg-background shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Inbox</p>
                  <h2 className="mt-1 font-heading text-xl">
                    Contact messages
                    {contactUnread > 0 && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 align-middle text-xs font-semibold text-primary">
                        {contactUnread} new
                      </span>
                    )}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Every submission from the public /contact form, with email
                    notifications on new arrivals.
                  </p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-background text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icons.arrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-center text-sm">
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {contactTotal}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {contactUnread}
                  </div>
                  <div className="text-xs text-muted-foreground">Unread</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
