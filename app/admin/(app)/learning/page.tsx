import Link from "next/link";

import { LearningForm } from "@/components/admin/learning-form";
import { getLearning } from "@/lib/admin/learning";

export const dynamic = "force-dynamic";

export default async function AdminLearningPage() {
  const learning = await getLearning();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl mb-1">
            Edit Certifications &amp; Learning
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the &quot;Current Focus&quot; and &quot;Certifications &amp;
            Tools&quot; cards shown between Professional Experience and
            Certificates on{" "}
            <Link
              href="/experience"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              /experience ↗
            </Link>{" "}
            and on the home page.
          </p>
        </div>
      </div>

      <LearningForm initial={learning} />
    </div>
  );
}
