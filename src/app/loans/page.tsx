import type { Metadata } from "next";
import Link from "next/link";
import { LOAN_TYPES } from "@/lib/loans";

export const metadata: Metadata = {
  title: "Our Loans",
  description: "Personal, foreigner, wedding, business and education loans from HMS Credit, a licensed moneylender in Singapore.",
};

export default function LoansPage() {
  return (
    <main className="page page-wide">
      <h1>Our Loans</h1>
      <p className="subtitle">
        Taking a loan from a licensed moneylender need not be daunting. Explore our loan options below — every
        product is structured around what you can comfortably repay.
      </p>

      <div className="loans-grid">
        {LOAN_TYPES.map((loan) => (
          <Link key={loan.slug} href={`/loans/${loan.slug}`} className="card loan-card">
            <h3>{loan.name}</h3>
            <p>{loan.tagline}</p>
            <span className="loan-card-link">Learn more &rarr;</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
