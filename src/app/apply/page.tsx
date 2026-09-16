import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Apply Now",
  description: "Apply for a loan with HMS Credit — instantly with Singpass, or fill in the form manually.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ singpassError?: string }>;
}) {
  const { singpassError } = await searchParams;

  return (
    <main className="page page-wide">
      <h1>Apply Now</h1>
      <p className="subtitle">Apply instantly with Singpass, or fill in the form yourself — whichever&apos;s easier.</p>

      {singpassError && (
        <div className="error-banner">
          Singpass sign-in isn&apos;t available right now. Please fill in the form below instead, or call us at +65
          6333 9061.
        </div>
      )}

      <div className="calc-layout">
        <div className="card">
          <h2>Apply with Singpass</h2>
          <p style={{ color: "var(--brand-body)", marginBottom: "1rem" }}>
            Sign in with Singpass and we&apos;ll pull your particulars from MyInfo automatically — no forms to fill,
            faster processing.
          </p>
          <a href="/api/auth/singpass/start" className="button" style={{ display: "inline-block" }}>
            Apply with Singpass
          </a>
        </div>

        <div className="card">
          <h2>Apply Manually</h2>
          <LeadForm />
        </div>
      </div>
    </main>
  );
}
