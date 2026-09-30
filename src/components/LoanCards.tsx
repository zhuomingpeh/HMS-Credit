import Link from "next/link";
import { LOAN_TYPES, type LoanType } from "@/lib/loans";
import { LineIcon, type IconName } from "./LineIcon";

export const LOAN_VISUALS: Record<string, { icon: IconName; label: string; theme: string }> = {
  "personal-loan": { icon: "personal", label: "Everyday needs", theme: "mint" },
  "foreigner-loan": { icon: "foreigner", label: "Working in Singapore", theme: "blue" },
  "wedding-loan": { icon: "wedding", label: "Life milestones", theme: "rose" },
  "business-loan": { icon: "business", label: "Working capital", theme: "sand" },
  "education-loan": { icon: "education", label: "Your next chapter", theme: "lilac" },
};
export function LoanCards({ loans = LOAN_TYPES, headingLevel = 2, calculator = true }: { loans?: LoanType[]; headingLevel?: 2 | 3; calculator?: boolean }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className="loans-grid">{loans.map(loan => {
    const visual = LOAN_VISUALS[loan.slug];
    return <Link key={loan.slug} href={`/loans/${loan.slug}`} className={`service-card service-${visual.theme}`}>
      <div className="service-card-top"><span className="service-icon"><LineIcon name={visual.icon} /></span><span className="service-category">{visual.label}</span></div>
      <Heading>{loan.name}</Heading><p>{loan.tagline}</p>
      <span className="service-card-link">Explore {loan.name.toLowerCase()} <LineIcon name="arrow" /></span>
    </Link>;
  })}{calculator && <Link href="/loan-calculator" className="service-card service-calculator">
    <div className="service-card-top"><span className="service-icon"><LineIcon name="calculator" /></span><span className="service-category">Plan ahead</span></div>
    <Heading>What would repayment look like?</Heading><p>Explore monthly payments with our reducing-balance calculator.</p>
    <span className="service-card-link">Calculate repayments <LineIcon name="arrow" /></span>
  </Link>}</div>;
}
