import { redirect } from "next/navigation";

interface ExperienceDetailPageProps {
  params: Promise<{
    expId: string;
  }>;
}

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  await params;
  redirect("/experience");
}
