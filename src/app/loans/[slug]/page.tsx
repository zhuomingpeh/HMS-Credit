import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/LeadForm";
import { LOAN_TYPES, getLoanType } from "@/lib/loans";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LoanCards, LOAN_VISUALS } from "@/components/LoanCards";
import { LineIcon } from "@/components/LineIcon";
import { JsonLd } from "@/components/JsonLd";
export function generateStaticParams() { return LOAN_TYPES.map(loan => ({ slug: loan.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const loan = getLoanType(slug); if (!loan) return {};
  const description = `${loan.tagline}. Explore ${loan.name.toLowerCase()} requirements and repayment options with HMS Credit at Sim Lim Square, Singapore.`;
  return { title: `${loan.name} in Singapore`, alternates: { canonical: `/loans/${loan.slug}` }, description,
    openGraph: { title: `${loan.name} in Singapore | HMS Credit`, description, url: `https://hmsmoney.com/loans/${loan.slug}`, images: ["/photos/storefront-entrance.jpg"] } };
}
export default async function LoanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const loan = getLoanType(slug); if (!loan) notFound(); const visual = LOAN_VISUALS[loan.slug];
  return <main id="main-content" className="page page-wide">
    <Breadcrumbs items={[{ name: "Our loans", href: "/loans" }, { name: loan.name, href: `/loans/${loan.slug}` }]} />
    <header className={`loan-detail-header service-${visual.theme}`}><span className="service-icon"><LineIcon name={visual.icon}/></span><div><span className="eyebrow">{visual.label}</span><h1>{loan.name}</h1><p className="subtitle">{loan.tagline}</p><a href="#apply" className="text-link loan-header-link">Enquire about this loan <LineIcon name="arrow"/></a></div></header>
    <div className="loan-content-layout"><div className="loan-content">
      <p className="loan-introduction">{loan.description}</p>
      <section className="loan-info-block"><h2>What you get</h2><ul className="bullet-list">{loan.bullets.map(b => <li key={b}>{b}</li>)}</ul></section>
      <section className="loan-info-block"><h2>What you’ll need</h2><ul className="bullet-list">{loan.eligibility.map(e => <li key={e}>{e}</li>)}</ul><p className="small-note">These are starting requirements. Our team will confirm the documents needed for your individual assessment.</p></section>
      <aside className="repayment-prompt"><LineIcon name="calculator"/><div><h3>Start with the monthly repayment.</h3><p>Use an estimate to see how a repayment could fit your budget. The calculator does not determine eligibility or approval.</p><Link href="/loan-calculator" className="text-link">Open the calculator <LineIcon name="arrow"/></Link></div></aside>
      <section className="loan-info-block"><h2>Before you decide</h2><p>Our team will explain the rate, fees and repayment schedule before you sign. Verification and completion take place at our Sim Lim Square office. Sending an enquiry does not guarantee approval.</p><Link className="text-link" href="/faq">Read the borrowing FAQ <LineIcon name="arrow"/></Link></section>
    </div><aside className="card enquiry-panel" id="apply"><span className="eyebrow">Let’s talk</span><h2>Enquire about this loan</h2><p className="small-note">Tell us a little about yourself. Our team will contact you to discuss the next step.</p><LeadForm loanType={loan.name}/><a className="enquiry-phone" href="tel:+6563339061"><LineIcon name="phone"/>Prefer to call? 6333 9061</a></aside></div>
    <section className="related-loans"><div className="section-heading"><span className="eyebrow">Explore your options</span><h2>Other ways we may be able to help.</h2></div><LoanCards loans={LOAN_TYPES.filter(l => l.slug !== loan.slug).slice(0,2)} headingLevel={3}/></section>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", "@id": `https://hmsmoney.com/loans/${loan.slug}#service`, name: loan.name, serviceType: loan.name, description: loan.description, url: `https://hmsmoney.com/loans/${loan.slug}`, provider: { "@id": "https://hmsmoney.com/#business" }, areaServed: { "@type": "Country", name: "Singapore" } }}/>
  </main>;
}
