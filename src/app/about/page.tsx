import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VisitOffice } from "@/components/VisitOffice";
import { LineIcon } from "@/components/LineIcon";
export const metadata: Metadata = {
  openGraph: { title: "About Us | HMS Credit", description: "HMS Credit is a licensed moneylender at Sim Lim Square, serving Singapore borrowers since 2017.", url: "https://hmsmoney.com/about", images: ["/photos/storefront-visit.jpg"] },
  alternates: { canonical: "/about" }, title: "About Us", description: "HMS Credit is a licensed moneylender at Sim Lim Square, serving Singapore borrowers since 2017.",
};
export default function AboutPage() {
  return <main id="main-content" className="page page-wide">
    <Breadcrumbs items={[{ name: "About us", href: "/about" }]} />
    <header className="page-intro"><span className="eyebrow">Your neighbourhood moneylender</span><h1>Personal service.<br/>Since 2017.</h1><p className="subtitle">HMS Credit is a licensed moneylender at Sim Lim Square. We help borrowers understand their loan options through clear, personal conversations.</p></header>
    <section className="about-story"><div><h2>A conversation comes first.</h2><p>Finding the right loan can feel overwhelming. Our team takes the time to understand what you need and explain the documents, assessment and repayment terms involved.</p><p>You can begin with a short online enquiry, then visit us at #01-08 Sim Lim Square. We explain the terms before you decide whether to proceed.</p><Link href="/loans" className="text-link">Explore our loan options <LineIcon name="arrow"/></Link></div>
      <dl className="company-facts"><div><dt>Registered company</dt><dd>HMS CREDIT PTE. LTD.</dd></div><div><dt>UEN</dt><dd>201703408D</dd></div><div><dt>Moneylender’s licence</dt><dd>91/2026</dd></div><div><dt>Serving borrowers since</dt><dd>2017</dd></div></dl>
    </section>
    <div className="registry-note"><LineIcon name="shield"/><p>Check our business details against the <a href="https://rom.mlaw.gov.sg/information-for-borrowers/list-of-licensed-moneylenders-in-singapore/" target="_blank" rel="noopener noreferrer">Ministry of Law’s list of licensed moneylenders</a>.</p></div>
    <VisitOffice />
  </main>;
}
