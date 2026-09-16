import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with HMS Credit — call, visit, or apply online.",
};

export default function ContactPage() {
  return (
    <main className="page page-wide">
      <h1>Contact Us</h1>
      <p className="subtitle">We&apos;re happy to answer any questions about our loans.</p>

      <div className="office-grid">
        <div className="card">
          <h3>Phone</h3>
          <a href="tel:+6563339061" style={{ color: "var(--brand-navy)", fontWeight: 700 }}>
            +65 6333 9061
          </a>
        </div>
        <div className="card">
          <h3>Email</h3>
          <a href="mailto:support@hmsmoney.com" style={{ color: "var(--brand-navy)", fontWeight: 700 }}>
            support@hmsmoney.com
          </a>
        </div>
        <div className="card">
          <h3>Office Hours</h3>
          <p style={{ color: "var(--brand-body)" }}>
            Mon&ndash;Sat: 11am&ndash;7pm
            <br />
            Sundays: by appointment
          </p>
        </div>
      </div>

      <div className="calc-layout">
        <div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3>Our Office</h3>
            <p style={{ color: "var(--brand-body)" }}>
              #01-08 Sim Lim Square
              <br />
              1 Rochor Canal Road, Singapore 188504
            </p>
          </div>

          <Image
            src="/photos/storefront-entrance.jpg"
            alt="HMS Credit's entrance at #01-08 Sim Lim Square"
            width={900}
            height={1861}
            className="about-photo"
          />
        </div>

        <div className="card" id="apply">
          <h2>Apply Now</h2>
          <LeadForm />
        </div>
      </div>
    </main>
  );
}
