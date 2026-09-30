import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { SingpassButton } from "@/components/SingpassButton";
import { headers } from "next/headers";
import { singpassAvailable } from "@/lib/singpass/availability";

export const metadata: Metadata = {
  alternates: { canonical: "/apply" },
  robots: { index: false, follow: false },
  title: "Apply Now",
  description: "Start a loan enquiry with HMS Credit. Send your details and our team will contact you about the next step.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ singpassError?: string; reviewError?: string; loanAmount?: string }>;
}) {
  const { singpassError, reviewError, loanAmount } = await searchParams;
  const parsedAmount = Number(loanAmount);
  const initialAmount = Number.isSafeInteger(parsedAmount) && parsedAmount >= 500 && parsedAmount <= 1000000 ? parsedAmount : undefined;
  const available = singpassAvailable((await headers()).get("host") ?? "");

  return (
    <main id="main-content" className="page page-wide">
      <h1>Apply Now</h1>
      <p className="subtitle">{available ? "Apply with Singpass, or fill in the form yourself." : "Fill in the form below and our team will contact you."}</p>

      {reviewError && <div className="error-banner" role="alert">This review session has expired or has already been used. If you did not see a confirmation, retrieve your details with Singpass again or use the manual form below.</div>}
      {singpassError && available && (
        <div className="error-banner" role="alert">
          Singpass sign-in isn&apos;t available right now. Please fill in the form below instead, or call us at +65
          6333 9061.
        </div>
      )}

      <div className="calc-layout">
        <div className="card">
          <h2>Apply with Singpass</h2>
          <p style={{ color: "var(--brand-body)", marginBottom: "1rem" }}>
            Singapore Citizens, Permanent Residents and eligible FIN holders can retrieve their details
            with Myinfo, review them, and submit a loan application to HMS Credit.
          </p>
          {available ? <><SingpassButton href={initialAmount ? `/api/auth/singpass/start?loanAmount=${initialAmount}` : undefined} />{process.env.SINGPASS_ENV !== "production" && <p>Testing environment — use official Singpass test accounts only.</p>}</> : <p>Singpass applications will be available after production approval. Please use the manual form to contact our team.</p>}
        </div>

        <div className="card">
          <h2>Apply Manually</h2>
          <LeadForm initialAmount={initialAmount} />
        </div>
      </div>
    </main>
  );
}
