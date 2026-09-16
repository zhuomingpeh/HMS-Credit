import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { LOAN_TYPES, getLoanType } from "@/lib/loans";

export function generateStaticParams() {
  return LOAN_TYPES.map((loan) => ({ slug: loan.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loan = getLoanType(slug);
  if (!loan) return {};
  return {
    title: loan.name,
    description: loan.description,
  };
}

export default async function LoanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loan = getLoanType(slug);
  if (!loan) notFound();

  return (
    <main className="page page-wide">
      <div className="loan-detail-kicker">Licensed Moneylender</div>
      <h1>{loan.name}</h1>
      <p className="subtitle">{loan.tagline}</p>

      <div className="calc-layout">
        <div>
          <p style={{ color: "var(--brand-body)", marginBottom: "1.5rem" }}>{loan.description}</p>

          <h2>What you get</h2>
          <ul className="bullet-list">
            {loan.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          <h2>Eligibility</h2>
          <ul className="bullet-list">
            {loan.eligibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card" id="apply">
          <h2>Enquire about this loan</h2>
          <LeadForm loanType={loan.name} />
        </div>
      </div>
    </main>
  );
}
