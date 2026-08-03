import { Metadata } from "next";

import { AnimatedSection } from "@/components/common/animated-section";
import { AnimatedText } from "@/components/common/animated-text";
import PageContainer from "@/components/common/page-container";
import { CertificatesCarousel } from "@/components/experience/certificates-carousel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Chip from "@/components/ui/chip";
import { pagesConfig } from "@/config/pages";
import { siteConfig } from "@/config/site";
import type { Experience } from "@/db/schema";
import { listCertificates } from "@/lib/admin/certificates";
import { listExperiences } from "@/lib/admin/experience";
import { getLearning } from "@/lib/admin/learning";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: pagesConfig.experience.metadata.title,
  description: pagesConfig.experience.metadata.description,
  alternates: {
    canonical: `${siteConfig.url}/experience`,
  },
  openGraph: {
    title: pagesConfig.experience.metadata.title,
    description: pagesConfig.experience.metadata.description,
    url: `${siteConfig.url}/experience`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage ?? siteConfig.iconIco,
        width: 1200,
        height: 630,
        alt: `${siteConfig.authorName} experience`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pagesConfig.experience.metadata.title,
    description: pagesConfig.experience.metadata.description,
    images: [siteConfig.ogImage ?? siteConfig.iconIco],
    creator: `@${siteConfig.username}`,
  },
};

function BulletCard({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <Card className="h-full border bg-background">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="font-heading text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RoleCard({ role }: { role: Experience }) {
  return (
    <Card className="h-full border bg-background">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="font-heading text-2xl">
              {role.title}
            </CardTitle>
            <p className="text-sm font-medium text-foreground">
              {role.company}
            </p>
            <p className="text-xs text-muted-foreground">{role.location}</p>
          </div>
          <Chip content={role.date} />
        </div>
        {role.description ? (
          <p className="text-sm text-muted-foreground">{role.description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm text-muted-foreground">
          {role.bullets.map((bullet, i) => (
            <li key={`${role.id}-${i}`} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default async function ExperiencePage() {
  const [professionalExperience, certificates, learning] = await Promise.all([
    listExperiences(),
    listCertificates(),
    getLearning(),
  ]);

  const learningSections = [
    { title: learning.currentFocusTitle, bullets: learning.currentFocusBullets },
    {
      title: learning.certificationsTitle,
      bullets: learning.certificationsBullets,
    },
  ];

  return (
    <PageContainer
      title={pagesConfig.experience.title}
      description={pagesConfig.experience.description}
    >
      <div className="space-y-10">
        <section className="space-y-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <AnimatedText
              as="h2"
              className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
            >
              Professional Experience
            </AnimatedText>
            <AnimatedText
              as="p"
              delay={0.2}
              className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
            >
              Roles across credit underwriting, retail banking, and small business research.
            </AnimatedText>
          </div>
          <div className="grid grid-cols-1 gap-4 w-full items-stretch">
            {professionalExperience.map((role, index) => (
              <AnimatedSection
                key={role.id}
                delay={0.1 * (index + 1)}
                direction="up"
                className="h-full"
              >
                <RoleCard role={role} />
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section className="space-y-6 bg-muted rounded-2xl py-8 px-4 sm:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <AnimatedText
              as="h2"
              className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
            >
              Certifications &amp; Learning
            </AnimatedText>
            <AnimatedText
              as="p"
              delay={0.2}
              className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
            >
              Ongoing study areas alongside certifications and tools that support long-term growth.
            </AnimatedText>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 w-full items-stretch">
            {learningSections.map((section, index) => (
              <AnimatedSection
                key={section.title}
                delay={0.1 * (index + 1)}
                direction="up"
                className="h-full"
              >
                <BulletCard title={section.title} bullets={section.bullets} />
              </AnimatedSection>
            ))}
          </div>
        </section>

        {certificates.length > 0 && (
          <section className="space-y-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <AnimatedText
                as="h2"
                className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
              >
                Certificates
              </AnimatedText>
              <AnimatedText
                as="p"
                delay={0.2}
                className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
              >
                A rotating gallery of earned certificates. Use the arrows or dots to browse.
              </AnimatedText>
            </div>
            <AnimatedSection direction="up" delay={0.1}>
              <CertificatesCarousel certificates={certificates} />
            </AnimatedSection>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
