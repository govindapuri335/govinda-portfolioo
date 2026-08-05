import Link from "next/link";

import { CertificatesManager } from "@/components/admin/certificates-manager";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { LearningForm } from "@/components/admin/learning-form";
import { listCertificates } from "@/lib/admin/certificates";
import { listExperiences } from "@/lib/admin/experience";
import { getLearning } from "@/lib/admin/learning";

export const dynamic = "force-dynamic";
export const metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const [experiences, certificates, learning] = await Promise.all([
    listExperiences(),
    listCertificates(),
    getLearning(),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl mb-1">Experience</h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, remove and reorder the roles shown on{" "}
            <Link
              href="/experience"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              /experience ↗
            </Link>
            . The Certifications &amp; Learning cards and Certificates carousel
            on the same page can also be edited below.
          </p>
        </div>
      </div>

      <section>
        <ExperienceManager initial={experiences} />
      </section>

      <section className="pt-6 border-t border-border">
        <div className="mb-4">
          <h2 className="font-heading text-xl mb-1">
            Certifications &amp; Learning
          </h2>
          <p className="text-sm text-muted-foreground">
            Edit the &quot;Current Focus&quot; and &quot;Certifications &amp;
            Tools&quot; cards shown between Professional Experience and
            Certificates.
          </p>
        </div>
        <LearningForm initial={learning} />
      </section>

      <section className="pt-6 border-t border-border">
        <div className="mb-4">
          <h2 className="font-heading text-xl mb-1">Certificates</h2>
          <p className="text-sm text-muted-foreground">
            Upload certificate images. They appear below the Certifications
            &amp; Learning section on /experience and rotate automatically.
          </p>
        </div>
        <CertificatesManager initial={certificates} />
      </section>
    </div>
  );
}
