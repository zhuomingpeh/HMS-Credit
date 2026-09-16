import type { Metadata } from "next";

export const metadata: Metadata = {
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
    a: "The amount you qualify for depends on your income and residency status, subject to the Ministry of Law's lending caps. Use our loan calculator for an estimate, or apply and we'll assess your specific situation.",
  },
  {
    q: "Is my personal information kept confidential?",
    a: "Yes. Your information is used only to assess your loan application and is handled in line with our privacy policy and the Personal Data Protection Act.",
  },
  {
    q: "How long does approval take?",
    a: "Once you submit your application with accurate details, our team will be in touch promptly. Final approval and disbursement happen after you visit our office to complete the necessary paperwork.",
  },
  {
    q: "What are the maximum interest rates and fees I can be charged?",
    a: "As a licensed moneylender, HMS Credit is bound by Ministry of Law caps: interest capped at 4% per month, late interest capped at 4% per month, and a late fee capped at $60 per month. We'll always be upfront about the exact rate and fees that apply to your loan before you sign.",
  },
];

export default function FaqPage() {
  return (
    <main className="page">
      <h1>Frequently Asked Questions</h1>
      <p className="subtitle">Common questions about borrowing from a licensed moneylender.</p>

      <div className="faq-list">
        {FAQS.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
