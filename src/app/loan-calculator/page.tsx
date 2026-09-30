import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Metadata } from "next";
import { LoanCalculatorWidget } from "@/components/LoanCalculatorWidget";

export const metadata: Metadata = {
  openGraph: { title: "Loan Calculator | HMS Credit", description: "Estimate your monthly installment before applying for a loan with HMS Credit.", url: "https://hmsmoney.com/loan-calculator", images: ["/photos/storefront-entrance.jpg"] },
  alternates: { canonical: "/loan-calculator" },
  title: "Loan Calculator",
  description: "Estimate your monthly installment before applying for a loan with HMS Credit.",
};

export default function LoanCalculatorPage() {
  return (
    <main id="main-content" className="page page-wide">
      <Breadcrumbs items={[{ name: "Loan calculator", href: "/loan-calculator" }]} />
      <span className="staff-login-eyebrow">PLAN BEFORE YOU BORROW</span>
      <h1>Loan Repayment Calculator</h1>
      <p className="subtitle">See your monthly payment, total interest and repayment schedule with a reducing-balance estimate.</p>
      <LoanCalculatorWidget />
    </main>
  );
}
