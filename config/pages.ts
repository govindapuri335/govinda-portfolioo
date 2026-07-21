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
    description:
      "Credit analyst in equipment finance focused on underwriting, lender submissions, business analysis, and structuring deals.",
    metadata: {
      title: "Govinda | Credit Analyst",
      description: `${siteConfig.authorName} is a credit analyst in equipment finance focused on underwriting, lender submissions, and business analysis.`,
    },
  },
  about: {
    title: "About Me",
    description:
      "Credit analyst based in Long Island, New York with experience reviewing business credit, guarantor strength, bank statements, PayNet history, and lender requirements.",
    metadata: {
      title: "About Me",
      description: `${siteConfig.authorName} is a credit analyst based in Long Island, New York.`,
    },
  },
  skills: {
    title: "Skills",
    description:
      "Credit, lending, and finance skills used to evaluate equipment finance deals.",
    metadata: {
      title: "Skills",
      description: `${siteConfig.authorName}'s credit, lending, and finance skills.`,
    },
  },
  contact: {
    title: "Want to connect?",
    description:
      "Open to conversations about equipment finance, credit analysis, commercial lending, AI in finance, and professional growth.",
    metadata: {
      title: "Want to connect?",
      description: `Contact ${siteConfig.authorName} about equipment finance and credit analysis.`,
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
      "Insights, notes, and updates on finance and professional growth.",
    metadata: {
      title: "Blogs",
      description: `${siteConfig.authorName}'s blogs about finance, credit analysis, and professional growth.`,
    },
  },
  experience: {
    title: "Experience",
    description:
      "Credit underwriting support, business review, and finance-focused analysis.",
    metadata: {
      title: "Experience",
      description: `${siteConfig.authorName}'s credit underwriting and equipment finance experience.`,
    },
  },
};
