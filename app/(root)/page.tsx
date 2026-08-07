import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import BlogCard from "@/components/blogs/blog-card";
import { AnimatedSection } from "@/components/common/animated-section";
import { AnimatedText } from "@/components/common/animated-text";
import { ClientPageWrapper } from "@/components/common/client-page-wrapper";
import { Icons } from "@/components/common/icons";
import SkillsCard from "@/components/skills/skills-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { experienceSections, heroParagraphs } from "@/config/experience";
import { pagesConfig } from "@/config/pages";
import { siteConfig } from "@/config/site";
import { getLearning } from "@/lib/admin/learning";
import { getAllBlogsMeta } from "@/lib/blogs";
import { getFeaturedSkills } from "@/lib/skills";
import { cn } from "@/lib/utils";

const profileImg = "/profile-img.jpg";

export const metadata: Metadata = {
  title: pagesConfig.home.metadata.title,
  description: pagesConfig.home.metadata.description,
  alternates: {
    canonical: siteConfig.url,
  },
};

function BulletCard({ title, bullets }: { title: string; bullets: string[] }) {
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

export const revalidate = 300;

export default async function IndexPage() {
  const latestBlogs = (await getAllBlogsMeta()).slice(0, 3);
  const featuredSkills = await getFeaturedSkills();
  const learning = await getLearning();

  const learningSections = [
    {
      title: learning.currentFocusTitle,
      bullets: learning.currentFocusBullets,
    },
    {
      title: learning.certificationsTitle,
      bullets: learning.certificationsBullets,
    },
  ];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.authorName,
    url: siteConfig.url,
    image: siteConfig.ogImage ?? siteConfig.iconIco,
    jobTitle: "Credit Analyst in Equipment Finance",
    sameAs: [siteConfig.links.linkedin, siteConfig.links.email],
  };

  return (
    <ClientPageWrapper>
      <Script
        id="schema-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <section className="space-y-6 pb-8 pt-6 mb-0 md:pb-12 md:py-20 lg:py-32 h-screen flex items-center">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center -mt-20">
          <Image
            src={profileImg}
            height={224}
            width={224}
            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 224px"
            className="bg-primary rounded-full mb-0 md:mb-2 w-24 h-24 sm:w-32 sm:h-32 md:w-56 md:h-56 object-cover border-8 border-primary"
            alt={`${siteConfig.authorName} - ${siteConfig.name}`}
            priority
          />
          <AnimatedText
            as="h1"
            delay={0.2}
            className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Hi, I'm Govinda!
          </AnimatedText>
          <AnimatedText
            as="h3"
            delay={0.4}
            className="font-heading text-lg sm:text-xl md:text-2xl text-muted-foreground mt-1"
          >
            Credit Analyst in Equipment Finance
          </AnimatedText>
          <div className="mt-2 max-w-[42rem] text-center space-y-3">
            {heroParagraphs.map((paragraph, index) => (
              <AnimatedText
                key={paragraph}
                as="p"
                delay={0.6 + index * 0.15}
                className="leading-normal text-muted-foreground text-sm sm:text-base"
              >
                {paragraph}
              </AnimatedText>
            ))}
          </div>
          <div className="flex flex-col mt-10 items-center justify-center sm:flex-row sm:space-x-4 gap-3">
            <AnimatedText delay={0.9}>
              <Link
                href="/resume"
                target="_blank"
                className={cn(buttonVariants({ size: "lg" }))}
                aria-label="View resume"
              >
                <Icons.post className="w-4 h-4 mr-2" /> Resume
              </Link>
            </AnimatedText>
            <AnimatedText delay={1.05}>
              <Link
                href="/contact"
                rel="noreferrer"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "lg",
                  })
                )}
                aria-label="Contact Govinda Puri"
              >
                <Icons.contact className="w-4 h-4 mr-2" /> Contact
              </Link>
            </AnimatedText>
          </div>
          <AnimatedText delay={1.25}>
            <Icons.chevronDown className="h-6 w-6 mt-10" />
          </AnimatedText>
        </div>
      </section>

      <AnimatedSection
        direction="up"
        className="container space-y-6 py-10 my-14"
        id="experience"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl"
          >
            {pagesConfig.experience.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
          >
            {pagesConfig.experience.description}
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
      </AnimatedSection>

      <AnimatedSection
        direction="up"
        className="container space-y-6 bg-muted py-10 my-14"
        id="certifications"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl"
          >
            Certifications &amp; Learning
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
          >
            A focused view of current study areas and completed training.
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
      </AnimatedSection>

      <AnimatedSection
        direction="up"
        className="container space-y-6 py-10 my-14"
        id="blogs"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl"
          >
            {pagesConfig.blogs.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
          >
            {pagesConfig.blogs.description}
          </AnimatedText>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full items-stretch">
          {latestBlogs.map((blog, index) => (
            <AnimatedSection
              key={blog.slug}
              delay={0.1 * (index + 1)}
              direction="up"
              className="h-full w-full min-w-0"
            >
              <BlogCard blog={blog} />
            </AnimatedSection>
          ))}
        </div>
        <AnimatedText delay={0.4} className="flex justify-center">
          <Link href="/blogs">
            <Button variant={"outline"} className="rounded-xl">
              <Icons.chevronDown className="mr-2 h-4 w-4" /> View All
            </Button>
          </Link>
        </AnimatedText>
      </AnimatedSection>

      <AnimatedSection
        direction="up"
        className="container space-y-6 bg-muted py-10 my-14"
        id="skills"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl"
          >
            {pagesConfig.skills.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7"
          >
            {pagesConfig.skills.description}
          </AnimatedText>
        </div>
        <SkillsCard skills={featuredSkills} />
        <AnimatedText delay={0.4} className="flex justify-center">
          <Link href="/skills">
            <Button variant={"outline"} className="rounded-xl">
              <Icons.chevronDown className="mr-2 h-4 w-4" /> View Skills
            </Button>
          </Link>
        </AnimatedText>
      </AnimatedSection>
    </ClientPageWrapper>
  );
}
