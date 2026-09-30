import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { TrustBar } from "@/components/TrustBar";
import { LoanCards } from "@/components/LoanCards";
import { VisitOffice } from "@/components/VisitOffice";
import { SingpassButton } from "@/components/SingpassButton";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <Image
          src="/photos/storefront-entrance.jpg"
          alt="HMS Credit's storefront at #01-08 Sim Lim Square"
          fill
          priority
          sizes="100vw"
          className="home-hero-bg"
        />
        <div className="home-hero-scrim" aria-hidden="true" />

        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <span className="eyebrow hero-eyebrow">HMS Credit · Sim Lim Square · Since 2017</span>
            <h1>Real people.<br/>Clearer loan choices.</h1>
            <p className="subtitle">
              A licensed moneylender in Singapore, here to talk through your needs. Explore your options, plan your repayments and meet our team at Sim Lim Square.
            </p>
            <div className="home-hero-cta-row">
              <Link href="/loan-calculator" className="button button-secondary">
                Loan Repayment Calculator
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
            <p className="home-hero-singpass-note">
              <SingpassButton href="/apply" />
            </p>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="page page-wide">
        <span className="eyebrow">Support for different needs</span>
        <h2>Find your starting point.</h2>
        <p className="subtitle">Five loan options. A conversation about what you need and what you can repay.</p>

        <LoanCards headingLevel={3} />
      </section>

      <section className="page page-wide">
        <h2>How to apply</h2>
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
            <p>Visit our office for identity checks, assessment and an explanation of the terms. Any loan is subject to approval.</p>
          </div>
        </div>
      </section>

      <div className="page page-wide home-visit"><VisitOffice /></div>
    </main>
  );
}
