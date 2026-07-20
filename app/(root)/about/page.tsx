import { Metadata } from "next";

import PageContainer from "@/components/common/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { aboutParagraphs } from "@/config/experience";
import { pagesConfig } from "@/config/pages";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: pagesConfig.about.metadata.title,
  description: pagesConfig.about.metadata.description,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: pagesConfig.about.metadata.title,
    description: pagesConfig.about.metadata.description,
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage ?? siteConfig.iconIco,
        width: 1200,
        height: 630,
        alt: `${siteConfig.authorName} about`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pagesConfig.about.metadata.title,
    description: pagesConfig.about.metadata.description,
    images: [siteConfig.ogImage ?? siteConfig.iconIco],
    creator: `@${siteConfig.username}`,
  },
};

export default function AboutPage() {
  return (
    <PageContainer
      title={pagesConfig.about.title}
      description={pagesConfig.about.description}
    >
      <Card className="border bg-background">
        <CardContent className="space-y-5 py-6">
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph} className="leading-8 text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
