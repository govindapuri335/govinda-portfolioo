import { Icons } from "@/components/common/icons";

export interface skillsInterface {
  name: string;
  description: string;
  rating: number;
  icon: any;
}

export const skillsUnsorted: skillsInterface[] = [
  {
    name: "Credit Analysis",
    description:
      "Evaluate borrower strength, deal structure, and repayment risk across equipment finance requests.",
    rating: 5,
    icon: Icons.billing,
  },
  {
    name: "Financial Statement Review",
    description:
      "Read income statements, balance sheets, and cash flow statements to find trends and risk signals.",
    rating: 5,
    icon: Icons.post,
  },
  {
    name: "Cash Flow Analysis",
    description:
      "Measure monthly cash performance and repayment capacity from bank statements and operating activity.",
    rating: 5,
    icon: Icons.calendar,
  },
  {
    name: "Business Credit",
    description:
      "Review business credit history, payment patterns, and overall credit behavior across applicants and guarantors.",
    rating: 5,
    icon: Icons.userFill,
  },
  {
    name: "PayNet",
    description:
      "Use PayNet history to understand prior leasing behavior, payment performance, and trade trends.",
    rating: 4,
    icon: Icons.link,
  },
  {
    name: "UCC Review",
    description:
      "Check UCC filings to understand collateral position and potential lien conflicts.",
    rating: 4,
    icon: Icons.page,
  },
  {
    name: "Risk Assessment",
    description:
      "Identify repayment, concentration, and structure risks before lender submissions move forward.",
    rating: 5,
    icon: Icons.warning,
  },
];

export const skills = skillsUnsorted
  .slice()
  .sort((a, b) => b.rating - a.rating);

export const featuredSkills = skills.slice(0, 6);
