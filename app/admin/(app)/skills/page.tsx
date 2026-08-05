import Link from "next/link";

import { SkillsManager } from "@/components/admin/skills-manager";
import { listSkills } from "@/lib/admin/skills";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const skills = await listSkills();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl mb-1">Skills</h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, and remove skills shown on{" "}
            <Link
              href="/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              /skills ↗
            </Link>{" "}
            and the home page.
          </p>
        </div>
      </div>

      <SkillsManager initial={skills} />
    </div>
  );
}
