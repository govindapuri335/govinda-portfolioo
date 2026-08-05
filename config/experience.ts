export interface ContentSection {
  title: string;
  bullets: string[];
}

export interface ExperienceRole {
  title: string;
  company: string;
  date: string;
  location: string;
  description?: string;
  bullets: string[];
}

export const heroParagraphs = [
  "I'm a credit analyst in equipment finance, focused on underwriting, lender submissions, business analysis, and helping structure deals that make sense.",
  "I'm currently building deeper expertise in commercial finance, credit risk, fraud awareness, and equipment leasing while working toward long-term growth in the industry.",
];

export const aboutParagraphs = [
  "I'm a credit analyst based in Long Island, New York, with experience reviewing business credit, guarantor strength, bank statements, PayNet history, entity structure, equipment details, and lender requirements.",
  "My work involves understanding both the numbers and the story behind a business. I enjoy breaking down complex deals, identifying risk, and presenting information clearly so lenders and sales teams can make better decisions.",
  "Outside of work, I'm focused on continuous improvement, studying for the CLFP, building better habits, fitness, and learning how finance, technology, and AI can create new opportunities.",
];

export const professionalExperience: ExperienceRole[] = [
  {
    title: "Credit Analyst & Underwriter",
    company: "MMP Capital",
    date: "03/2024 – Present",
    location: "Farmingdale, NY",
    description:
      "Equipment financing and leasing company lending nationwide.",
    bullets: [
      "Underwrite equipment finance and leasing transactions up to $1.7 million for commercial borrowers nationwide, holding independent credit approval authority to $250,000.",
      "Analyze business and personal financial statements, tax returns, and bank statements to assess cash flow, liquidity, leverage, and repayment capacity under credit policy.",
      "Render credit decisions within hours on transactions averaging approximately $150,000; structure and syndicate larger, more complex requests across approximately 10 lending partners, securing lender decisions typically within 24 hours.",
      "Structure term, pricing, collateral, and guaranty requirements with sales representatives to fit borrower risk profiles within credit policy and portfolio risk appetite.",
      "Present approvals, declines, stipulations, and counteroffers to brokers, vendors, sales teams, and lending partners, sustaining high-volume deal flow without sacrificing credit quality.",
      "Detect and escalate fraud indicators and policy exceptions during file review, protecting portfolio quality.",
      "Represent credit at weekend trade shows and vendor sales events, partnering with sales teams to accelerate financing opportunities.",
    ],
  },
  {
    title: "Bank Teller",
    company: "Dime Community Bank",
    date: "09/2023 – 03/2024",
    location: "Garden City, NY",
    bullets: [
      "Processed high-volume cash transactions with full accuracy under banking regulations and cash-handling procedures while resolving customer issues and supporting branch product goals.",
    ],
  },
  {
    title: "Research Intern",
    company: "FSC Small Business Development Center",
    date: "01/2023 – 06/2023",
    location: "Farmingdale, NY",
    bullets: [
      "Researched funding and advisory resources for entrepreneurs with disabilities.",
    ],
  },
];

// Retained for the home page bullet grid summary.
export const experienceSections: ContentSection[] = [
  {
    title: "Credit & Underwriting",
    bullets: [
      "Equipment finance underwriting support",
      "Bank statement and cash flow review",
      "Business and guarantor credit analysis",
      "Lender submission write-ups",
      "Entity structure review",
      "PayNet, SOS, UCC, and vendor review support",
    ],
  },
  {
    title: "Industries I've Reviewed",
    bullets: [
      "Medical and aesthetic equipment",
      "Construction equipment",
      "Printing and signage equipment",
      "Restaurant and bakery equipment",
      "Transportation and commercial assets",
      "General small business financing",
    ],
  },
];

export const learningSections: ContentSection[] = [
  {
    title: "Current Focus",
    bullets: [
      "CLFP preparation",
      "Equipment leasing and finance",
      "Vendor fraud awareness",
      "Commercial credit analysis",
      "AI tools for finance productivity",
    ],
  },
  {
    title: "Certifications & Tools",
    bullets: [
      "Certified Lease & Finance Professional (CLFP) — Candidate; exam expected November 2026",
      "Credit Risk Analysis & Underwriting — Coursera & Starweaver, 2025",
      "Business Analytics Certificate — Harvard Business School Online, 2024",
      "Advanced Excel (regression, data analysis) · Salesforce · Microsoft Word, PowerPoint, Outlook",
    ],
  },
];
