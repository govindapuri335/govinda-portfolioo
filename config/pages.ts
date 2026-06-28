import { ValidPages } from "./constants";
import { siteConfig } from "./site";

type PagesConfig = {
  [key in ValidPages]: {
    title: string;
    description: string;
    metadata: {
      title: string;
      description: string;
    };
    // featuredDescription: string;
  };
};

export const pagesConfig: PagesConfig = {
  home: {
    title: "Home",
    description: "Welcome to my portfolio website.",
    metadata: {
      title: "Home",
      description: `${siteConfig.authorName}'s portfolio website.`,
    },
  },
  skills: {
    title: "Skills",
    description: "Key skills that define my professional identity.",
    metadata: {
      title: "Skills",
      description: `${siteConfig.authorName}'s key skills that define their professional identity.`,
    },
  },
  projects: {
    title: "Projects",
    description: "Showcasing impactful projects and technical achievements.",
    metadata: {
      title: "Projects",
      description: `${siteConfig.authorName}'s projects in building web applications.`,
    },
  },
  contact: {
    title: "Contact",
    description: "Let's connect and explore collaborations.",
    metadata: {
      title: "Contact",
      description: `Contact ${siteConfig.authorName}.`,
    },
  },
  resume: {
    title: "Resume",
    description: `${siteConfig.authorName}'s resume.`,
    metadata: {
      title: "Resume",
      description: `${siteConfig.authorName}'s resume.`,
    },
  },
  blogs: {
    title: "Blogs",
    description:
      "Thoughts on AI, software engineering, and building in public.",
    metadata: {
      title: "Blogs",
      description: `${siteConfig.authorName}'s blog — thoughts on AI, software engineering, and building in public.`,
    },
  },
  experience: {
    title: "Experience",
    description: "Professional journey and career timeline.",
    metadata: {
      title: "Experience",
      description: `${siteConfig.authorName}'s professional journey and experience timeline.`,
    },
  },
};
