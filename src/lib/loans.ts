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
    tagline: "Hassle-free funds for whatever life throws at you",
    description:
      "From medical bills to a shortfall between paychecks, our personal loans are structured around what you can comfortably repay — not a one-size-fits-all package.",
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
      "Work Permit, S Pass, and E Pass holders can face financing gaps banks won't cover. We assess foreign employees on their actual ability to repay, not just their residency status.",
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
    tagline: "Fund your big day without draining your savings",
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
      "Cash flow gaps, stock purchases, or a short-term opportunity — sole proprietors and small business owners can borrow against the business's ability to repay, without the paperwork a bank demands.",
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
      "Course fees, tuition, or a certification that pays off in your next job — an education loan covers costs that build your future, on repayment terms that match your study or work schedule.",
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
