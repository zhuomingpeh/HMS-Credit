import type { Metadata } from "next";
import Link from "next/link";
import { LOAN_TYPES } from "@/lib/loans";
import { LoanCards } from "@/components/LoanCards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { VisitOffice } from "@/components/VisitOffice";
import { LineIcon } from "@/components/LineIcon";

export const metadata: Metadata = {
  openGraph: { title: "Loan Options in Singapore | HMS Credit", description: "Explore personal, foreigner, wedding, business and education loans. Check the requirements and plan repayments with HMS Credit at Sim Lim Square.", url: "https://hmsmoney.com/loans", images: ["/photos/storefront-entrance.jpg"] },
  alternates: { canonical: "/loans" }, title: "Loan Options in Singapore",
  description: "Explore personal, foreigner, wedding, business and education loans. Check the requirements and plan repayments with HMS Credit at Sim Lim Square.",
};
export default function LoansPage() {
  return <main id="main-content" className="page page-wide loans-page">
    <Breadcrumbs items={[{ name: "Our loans", href: "/loans" }]} />
    <header className="catalogue-heading"><div><h1>Find the loan<br/>for your needs.</h1><p className="subtitle">Compare our five loan options, check the requirements and estimate your repayments. Our team can help you work through the details.</p></div><div className="catalogue-assurance"><LineIcon name="shield"/><span>Licensed moneylender<strong>HMS Credit · Since 2017</strong><small>Licence No. 91/2026</small></span></div></header>
    <LoanCards />
    <p className="catalogue-note">Every application is assessed individually. Eligibility, loan amount and terms are subject to assessment and approval.</p>
    <section className="process-section"><div className="section-heading"><h2>What happens after your enquiry</h2></div><ol className="process-grid">
      <li><span className="process-number">01</span><h3>Tell us what you need</h3><p>Send a short enquiry with your contact details and the amount you have in mind.</p></li>
      <li><span className="process-number">02</span><h3>Talk through the details</h3><p>Our team will contact you and explain the documents needed for your assessment.</p></li>
      <li><span className="process-number">03</span><h3>Visit and review the terms</h3><p>Complete verification at our office. Understand the rate, fees and repayment schedule before signing.</p></li>
    </ol><Link href="/faq" className="text-link">Read common borrowing questions <LineIcon name="arrow" /></Link></section>
    <VisitOffice />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: "HMS Credit loan options", itemListElement: LOAN_TYPES.map((loan, i) => ({ "@type": "ListItem", position: i + 1, name: loan.name, url: `https://hmsmoney.com/loans/${loan.slug}` })) }} />
  </main>;
}
