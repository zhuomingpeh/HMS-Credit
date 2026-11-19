export type LoanType = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  eligibility: string[];
};

// Matches the products listed on HMS Credit's Sim Lim Square storefront signage.
export const LOAN_TYPES: LoanType[] = [
  {
    slug: "personal-loan",
    name: "Personal Loan",
    tagline: "Support for everyday expenses and unexpected costs",
    description:
      "Discuss a personal loan for medical bills, household expenses or a shortfall between paydays. Our team will review your income and existing commitments to assess what you can repay.",
    bullets: [
      "Flexible repayment tenure",
      "Funds disbursed shortly after approval",
      "No collateral required",
    ],
    eligibility: [
      "Singapore Citizen, PR, or eligible pass holder",
      "21 years old and above",
      "Proof of income (payslip, CPF or NOA)",
    ],
  },
  {
    slug: "foreigner-loan",
    name: "Foreigner Loan",
    tagline: "Financial support while you're working in Singapore",
    description:
      "Working in Singapore on a Work Permit, S Pass or E Pass? Speak with our team about a loan assessment based on your employment, income and ability to repay.",
    bullets: [
      "Open to Work Permit, S Pass and E Pass holders",
      "Simple documentation",
      "English-speaking staff to walk you through the process",
    ],
    eligibility: [
      "Valid Work Permit, S Pass, or E Pass",
      "21 years old and above",
      "Proof of employment in Singapore",
    ],
  },
  {
    slug: "wedding-loan",
    name: "Wedding Loan",
    tagline: "Plan wedding expenses around a considered budget",
    description:
      "Banquets, photography, the ring — wedding costs add up fast. A wedding loan lets you spread the cost over a repayment plan that fits your budget instead of paying it all upfront.",
    bullets: [
      "Loan amounts sized to your wedding budget",
      "Repayment plans that fit around the big day",
      "Fast processing so vendor deposits aren't delayed",
    ],
    eligibility: [
      "Singapore Citizen, PR, or eligible pass holder",
      "21 years old and above",
      "Proof of income",
    ],
  },
  {
    slug: "business-loan",
    name: "Business Loan",
    tagline: "Working capital for small business owners",
    description:
      "Manage cash flow gaps, purchase stock, or take advantage of short-term business opportunities. Our business loans provide sole proprietors and small business owners with access to working capital, based on the business’s ability to repay — with a simpler application process and less paperwork than traditional bank financing.",
    bullets: [
      "Short-term working capital",
      "Suited to sole proprietors and small businesses",
      "Straightforward, fast-turnaround assessment",
    ],
    eligibility: [
      "Registered sole proprietorship or business owner",
      "21 years old and above",
      "Proof of business income",
    ],
  },
  {
    slug: "education-loan",
    name: "Education Loan",
    tagline: "Invest in tuition, courses, and upskilling",
    description:
      "Discuss funding for tuition, course fees or professional training. Consider the full cost of your course alongside your income and regular commitments before deciding to borrow.",
    bullets: [
      "Covers tuition and course-related expenses",
      "Repayment terms that fit around your schedule",
      "Applies to full-time study or part-time upskilling",
    ],
    eligibility: [
      "Singapore Citizen, PR, or eligible pass holder",
      "21 years old and above",
      "Proof of income or a guarantor",
    ],
  },
];

export function getLoanType(slug: string): LoanType | undefined {
  return LOAN_TYPES.find((loan) => loan.slug === slug);
}
