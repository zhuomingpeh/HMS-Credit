import Link from "next/link";
import { LOAN_TYPES, type LoanType } from "@/lib/loans";
import { LineIcon, type IconName } from "./LineIcon";
import styles from "./LoanCards.module.css";

export const LOAN_VISUALS: Record<string, { icon: IconName; label: string; theme: string }> = {
  "personal-loan": { icon: "personal", label: "Everyday needs", theme: "mint" },
  "foreigner-loan": { icon: "foreigner", label: "Working in Singapore", theme: "blue" },
  "wedding-loan": { icon: "wedding", label: "Life milestones", theme: "rose" },
  "business-loan": { icon: "business", label: "Working capital", theme: "sand" },
  "education-loan": { icon: "education", label: "Study and training", theme: "mint" },
};
export function LoanCards({ loans = LOAN_TYPES, headingLevel = 2, calculator = true }: { loans?: LoanType[]; headingLevel?: 2 | 3; calculator?: boolean }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className={styles.list}>
    {loans.map(loan => <Link key={loan.slug} href={`/loans/${loan.slug}`} className={styles.loan}>
      <span className={styles.icon}><LineIcon name={LOAN_VISUALS[loan.slug].icon} /></span>
      <div><Heading>{loan.name}</Heading><p>{loan.tagline}</p></div>
      <span className={styles.arrow}><LineIcon name="arrow" /></span>
    </Link>)}
    {calculator && <Link href="/loan-calculator" className={styles.calculator}>
      <span className={styles.icon}><LineIcon name="calculator" /></span>
      <div><Heading>Plan your repayments</Heading><p>Estimate the monthly payment before you apply.</p><span className={styles.calculatorLink}>Use the loan calculator <LineIcon name="arrow" /></span></div>
    </Link>}
  </div>;
}
