import type { Metadata } from "next";
import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LineIcon } from "@/components/LineIcon";
export const metadata: Metadata = {
  openGraph: { title: "Contact Us | HMS Credit", description: "Visit HMS Credit at #01-08 Sim Lim Square, 1 Rochor Canal Road. Call 6333 9061. Open Monday to Saturday, 11am to 7pm.", url: "https://hmsmoney.com/contact", images: ["/photos/storefront-visit.jpg"] },
  alternates: { canonical: "/contact" }, title: "Contact & Visit Us", description: "Visit HMS Credit at #01-08 Sim Lim Square, 1 Rochor Canal Road. Call 6333 9061. Open Monday to Saturday, 11am to 7pm.",
};
export default function ContactPage() {
  return <main id="main-content" className="page page-wide">
    <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
    <header className="page-intro"><span className="eyebrow">We’re here to help</span><h1>Let’s talk it through.</h1><p className="subtitle">Ask a question, discuss your application or come by our office. You’ll find us on the ground floor of Sim Lim Square.</p></header>
    <div className="office-grid">
      <a className="contact-tile" href="tel:+6563339061"><LineIcon name="phone"/><span>Call our team<strong>+65 6333 9061</strong></span><LineIcon name="arrow"/></a>
      <a className="contact-tile" href="mailto:support@hmsmoney.com"><LineIcon name="mail"/><span>Email us<strong>support@hmsmoney.com</strong></span><LineIcon name="arrow"/></a>
      <div className="contact-tile"><LineIcon name="clock"/><span>Monday–Saturday<strong>11am–7pm</strong></span></div>
    </div>
    <div className="contact-layout"><section className="office-visit-card"><Image src="/photos/storefront-visit.jpg" alt="HMS Credit’s office entrance at unit 01-08 in Sim Lim Square" width={1536} height={2048} sizes="(max-width: 720px) 100vw, 550px"/><div><span className="eyebrow">Visit HMS Credit</span><h2>Sim Lim Square, #01-08</h2><address>1 Rochor Canal Road<br/>Singapore 188504</address><p>Sundays by appointment only.<br/>Closed on public holidays.</p><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=HMS+Credit+1+Rochor+Canal+Road+Singapore+188504" target="_blank" rel="noopener noreferrer">Get directions <LineIcon name="arrow"/></a></div></section>
      <section className="card enquiry-panel" id="apply"><span className="eyebrow">Start a conversation</span><h2>Send an enquiry</h2><p className="small-note">Leave your details and our team will contact you about your loan enquiry.</p><LeadForm/></section>
    </div>
  </main>;
}
