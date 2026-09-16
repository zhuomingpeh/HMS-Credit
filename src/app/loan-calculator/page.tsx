import type { Metadata } from "next";
import { LoanCalculatorWidget } from "@/components/LoanCalculatorWidget";

export const metadata: Metadata = {
  title: "Loan Calculator",
  description: "Estimate your monthly installment before applying for a loan with HMS Credit.",
};

export default function LoanCalculatorPage() {
  return (
    <main className="page page-wide">
      <h1>Loan Qualification Calculator</h1>
      <p className="subtitle">Adjust the amount, term, and interest rate to see an estimated monthly installment.</p>
      <LoanCalculatorWidget />
    </main>
  );
}
