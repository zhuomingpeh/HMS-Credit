import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description: "HMS Credit is a licensed moneylender at Sim Lim Square, serving Singapore borrowers since 2010.",
};

export default function AboutPage() {
  return (
    <main className="page page-wide">
      <h1>About HMS Credit</h1>
      <p className="subtitle">Reliable &amp; trusted, since 2010.</p>

      <div className="about-layout">
        <div>
          <p style={{ marginBottom: "1rem", color: "var(--brand-body)" }}>
            HMS Credit has been helping individuals in Singapore with their loan needs for well over a decade. We
            understand that finding the right loan can be overwhelming — that&apos;s why our team of dedicated
            professionals focuses on personalised solutions and straightforward, transparent service.
          </p>

          <p style={{ marginBottom: "1rem", color: "var(--brand-body)" }}>
            When you choose HMS Credit, you&apos;re working with a licensed moneylender approved by the Ministry of
            Law. We adhere to all regulations set out by the Registry of Moneylenders, so you&apos;ll always have a
            clear understanding of interest rates, fees, and repayment terms before you commit.
          </p>

          <p style={{ marginBottom: "1.5rem", color: "var(--brand-body)" }}>
            Don&apos;t let the thought of borrowing from a licensed moneylender deter you. Visit our office at
            #01-08 Sim Lim Square, or fill out our online form, and let us guide you toward a brighter financial
            future.
          </p>

          <div className="card">
            <h3>Visit Us</h3>
            <p style={{ color: "var(--brand-body)" }}>
              #01-08 Sim Lim Square, 1 Rochor Canal Road, Singapore 188504
              <br />
              Monday&ndash;Saturday: 11am&ndash;7pm &middot; Sundays: by appointment only
              <br />
              Closed on public holidays
            </p>
          </div>
        </div>

        <Image
          src="/photos/storefront-full.jpg"
          alt="HMS Credit's storefront at #01-08 Sim Lim Square"
          width={900}
          height={1474}
          className="about-photo"
        />
      </div>
    </main>
  );
}
