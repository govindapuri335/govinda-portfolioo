import Link from "next/link";

import { AboutForm } from "@/components/admin/about-form";
import { getAbout } from "@/lib/admin/about";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const about = await getAbout();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl mb-1">Edit About page</h1>
          <p className="text-sm text-muted-foreground">
            Update the two sections shown on{" "}
            <Link
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              /about ↗
            </Link>
            .
          </p>
        </div>
      </div>

      <AboutForm initial={about} />
    </div>
  );
}
