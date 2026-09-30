import Image from "next/image";
import Link from "next/link";
import { LineIcon } from "./LineIcon";
export function VisitOffice() {
  return <section className="visit-panel" aria-labelledby="visit-heading">
    <div className="visit-panel-copy"><span className="eyebrow">A real place. A personal conversation.</span><h2 id="visit-heading">Meet us at Sim Lim Square.</h2>
      <p>Speak with our team, ask your questions and understand the repayment terms before making a decision.</p>
      <address><LineIcon name="pin" /><span>#01-08 Sim Lim Square<br/>1 Rochor Canal Road, Singapore 188504</span></address>
      <p className="visit-hours">Monday–Saturday, 11am–7pm<br/>Sundays by appointment · Closed on public holidays</p>
      <div className="action-row"><a className="button" href="tel:+6563339061"><LineIcon name="phone" />6333 9061</a><Link className="text-link" href="/contact">Plan your visit <LineIcon name="arrow" /></Link></div>
    </div>
    <Image src="/photos/storefront-visit.jpg" alt="The entrance to HMS Credit at unit 01-08, Sim Lim Square" width={1536} height={2048} sizes="(max-width: 720px) 100vw, 480px" className="visit-panel-photo" />
  </section>;
}
