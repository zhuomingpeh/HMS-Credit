import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LineIcon } from "@/components/LineIcon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: { title: "FAQ | HMS Credit", description: "Frequently asked questions about borrowing from HMS Credit, a licensed moneylender in Singapore.", url: "https://hmsmoney.com/faq", images: ["/photos/storefront-entrance.jpg"] },
  alternates: { canonical: "/faq" },
  title: "FAQ",
  description: "Frequently asked questions about borrowing from HMS Credit, a licensed moneylender in Singapore.",
};

const FAQS = [
  {
    q: "How do I verify if a moneylender is licensed?",
    a: "You can check the Ministry of Law's official Registry of Moneylenders online. HMS Credit Pte Ltd is a licensed moneylender — our registration is listed there, and our physical address and phone number should always match what's shown in the registry.",
  },
  {
    q: "What documents do I need to apply?",
    a: "Typically your NRIC or pass, proof of income (payslips, CPF contribution history, or Notice of Assessment), and proof of residence. Our staff will let you know exactly what's needed once we review your application.",
  },
  {
    q: "How much can I borrow?",
    a: "The amount you qualify for depends on your income and residency status, subject to the Ministry of Law's lending caps. Our calculator estimates repayments only; it does not assess eligibility or the amount you can borrow. Contact our team for an assessment.",
  },
  {
    q: "Is my personal information kept confidential?",
    a: "Yes. Your information is used only to assess your loan application and is handled in line with our privacy policy and the Personal Data Protection Act.",
  },
  {
    q: "How long does approval take?",
    a: "Once you submit your application with accurate details, our team will be in touch promptly. Final approval and disbursement happen after you visit our office to complete the necessary paperwork.",
  },
];

export default function FaqPage() {
  return (
    <main id="main-content" className="page">
      <Breadcrumbs items={[{ name: "FAQ", href: "/faq" }]} />
      <span className="eyebrow">Clear answers before you apply</span>
      <h1>Your questions, answered.</h1>
      <p className="subtitle">Common questions about borrowing from a licensed moneylender.</p>

      <div className="faq-list">
        {FAQS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <div className="faq-support"><LineIcon name="phone"/><div><h2>Still have a question?</h2><p>Talk to our team at <a href="tel:+6563339061">6333 9061</a>, or <Link href="/contact">plan a visit to our office</Link>.</p></div></div>
      <p className="small-note">For independent information, read the <a href="https://rom.mlaw.gov.sg/information-for-borrowers/guide-to-borrowing-from-licensed-moneylenders-english/" target="_blank" rel="noopener noreferrer">Ministry of Law’s guide to borrowing from licensed moneylenders</a>.</p>
    </main>
  );
}
