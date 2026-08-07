import { Metadata } from "next";

import PageContainer from "@/components/common/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { aboutParagraphs } from "@/config/experience";
import { pagesConfig } from "@/config/pages";
import { siteConfig } from "@/config/site";
import {
  defaultCommunityItems,
  defaultCommunityTitle,
  getAbout,
} from "@/lib/admin/about";

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

export const revalidate = 300;

async function loadContent() {
  try {
    const row = await getAbout();
    return {
      paragraphs:
        row.introParagraphs.length > 0 ? row.introParagraphs : aboutParagraphs,
      communityTitle: row.communityTitle || defaultCommunityTitle,
      communityItems:
        row.communityItems.length > 0 ? row.communityItems : defaultCommunityItems,
    };
  } catch {
    // DB unavailable at build/runtime — fall back to static defaults so the
    // page never breaks.
    return {
      paragraphs: aboutParagraphs,
      communityTitle: defaultCommunityTitle,
      communityItems: defaultCommunityItems,
    };
  }
}

export default async function AboutPage() {
  const { paragraphs, communityTitle, communityItems } = await loadContent();

  return (
    <PageContainer
      title={pagesConfig.about.title}
      description={pagesConfig.about.description}
    >
      <div className="space-y-6">
        <Card className="border bg-background">
          <CardContent className="space-y-5 py-6">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="leading-8 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="border bg-background">
          <CardContent className="space-y-3 py-6">
            <h2 className="text-xl font-semibold text-foreground">
              {communityTitle}
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-8 text-muted-foreground">
              {communityItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
