import { Metadata } from "next";

import PageContainer from "@/components/common/page-container";
import SkillsCard from "@/components/skills/skills-card";
import { pagesConfig } from "@/config/pages";
import { siteConfig } from "@/config/site";
import { getPublicSkills } from "@/lib/skills";

export const metadata: Metadata = {
  title: pagesConfig.skills.metadata.title,
  description: pagesConfig.skills.metadata.description,
  alternates: {
    canonical: `${siteConfig.url}/skills`,
  },
  openGraph: {
    title: `${pagesConfig.skills.metadata.title} | ${siteConfig.name}`,
    description: pagesConfig.skills.metadata.description,
    url: `${siteConfig.url}/skills`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage ?? siteConfig.iconIco,
        width: 1200,
        height: 630,
        alt: `${siteConfig.authorName} skills`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pagesConfig.skills.metadata.title} | ${siteConfig.name}`,
    description: pagesConfig.skills.metadata.description,
    images: [siteConfig.ogImage ?? siteConfig.iconIco],
    creator: `@${siteConfig.username}`,
  },
};

export const revalidate = 300;

export default async function SkillsPage() {
  const skills = await getPublicSkills();
  return (
    <PageContainer
      title={pagesConfig.skills.title}
      description={pagesConfig.skills.description}
    >
      <SkillsCard skills={skills} />
    </PageContainer>
  );
}
