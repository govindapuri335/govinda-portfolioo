import { Metadata } from "next";

import { AnimatedSection } from "@/components/common/animated-section";
import { AnimatedText } from "@/components/common/animated-text";
import PageContainer from "@/components/common/page-container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { experienceSections, learningSections } from "@/config/experience";
import { pagesConfig } from "@/config/pages";
import { siteConfig } from "@/config/site";

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

export default function ExperiencePage() {
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
              Experience / What I Do
            </AnimatedText>
            <AnimatedText
              as="p"
              delay={0.2}
              className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
            >
              Credit underwriting support, deal review, and lender-ready write-ups.
            </AnimatedText>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 w-full items-stretch">
            {experienceSections.map((section, index) => (
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
              Ongoing study areas and completed training that support long-term growth.
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
      </div>
    </PageContainer>
  );
}