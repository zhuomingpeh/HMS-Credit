import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { TrustBar } from "@/components/TrustBar";
import { LOAN_TYPES } from "@/lib/loans";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <h1>Your Reliable &amp; Trusted Money Lender in Singapore</h1>
            <p className="subtitle">
              In times of financial emergencies, trust HMS Credit — a reliable and licensed moneylender with over a
              decade of experience. Whether it&apos;s a personal loan, a wedding loan, or funds for your next big
              step, we have your best interests at heart.
            </p>
            <div className="home-hero-cta-row">
              <Link href="/loan-calculator" className="button button-secondary">
                Loan Qualification Calculator
              </Link>
              <a href="tel:+6563339061" className="button button-secondary">
                Call +65 6333 9061
              </a>
            </div>
            <p className="home-hero-note">
              Visit our friendly staff at #01-08 Sim Lim Square, or fill up the form to have us reach out to you.
            </p>
          </div>

          <div className="home-hero-form" id="apply">
            <h2>Get started</h2>
            <LeadForm />
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="page page-wide">
        <h2>Discover our range of loan options</h2>
        <p className="subtitle">Experience peace of mind by borrowing from a licensed moneylender today.</p>

        <div className="loans-grid">
          {LOAN_TYPES.map((loan) => (
            <Link key={loan.slug} href={`/loans/${loan.slug}`} className="card loan-card">
              <h3>{loan.name}</h3>
              <p>{loan.tagline}</p>
              <span className="loan-card-link">Learn more &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page page-wide">
        <h2>2 steps away from your loan approval</h2>
        <div className="steps-grid">
          <div className="card">
            <span className="step-badge">1</span>
            <h3>Fill in our online application form</h3>
            <p>
              Make sure all details filled in are accurate to avoid delays. Once submitted, our team will be in
              touch with you.
            </p>
          </div>
          <div className="card">
            <span className="step-badge">2</span>
            <h3>Visit our office to complete your loan</h3>
            <p>After your application is processed, visit us to fill in the mandatory forms and your loan will be issued.</p>
          </div>
        </div>
      </section>

      <section className="page page-wide">
        <h2>Reliable &amp; Trusted</h2>
        <p className="subtitle">
          Financial emergencies can arise anytime — we understand that, which is why we&apos;re dedicated to helping
          you with competitively designed loan packages. Having served the industry for well over a decade, HMS
          Credit Pte Ltd is committed to being your reliable and trusted choice for all your loan needs.
        </p>

        <div className="about-layout">
          <div className="card" style={{ maxWidth: 520 }}>
            <h3>Visit Us</h3>
            <p style={{ color: "var(--brand-body)", marginBottom: "0.75rem" }}>
              #01-08 Sim Lim Square
              <br />
              1 Rochor Canal Road, Singapore 188504
            </p>
            <p style={{ color: "var(--brand-body)", marginBottom: "0.75rem" }}>
              Monday&ndash;Saturday: 11am&ndash;7pm
              <br />
              Sundays: by appointment only
              <br />
              Closed on public holidays
            </p>
            <a href="tel:+6563339061" className="button" style={{ display: "inline-block" }}>
              Call +65 6333 9061
            </a>
          </div>

          <Image
            src="/photos/storefront-full.jpg"
            alt="HMS Credit's storefront at #01-08 Sim Lim Square"
            width={900}
            height={1474}
            className="about-photo"
          />
        </div>
      </section>
    </>
  );
}
