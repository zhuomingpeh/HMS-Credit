import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { TrustBar } from "@/components/TrustBar";
import { LoanCards } from "@/components/LoanCards";
import { VisitOffice } from "@/components/VisitOffice";
import { SingpassButton } from "@/components/SingpassButton";
import { LineIcon } from "@/components/LineIcon";
import styles from "./home.module.css";

export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return <main id="main-content">
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 id="home-heading">Loans in Singapore.<br /><span>Let’s talk<br />it through.</span></h1>
          <p>Understand your options and repayments with HMS Credit, a licensed moneylender at Sim Lim Square. Serving borrowers since 2017.</p>
          <div className={styles.actions}>
            <Link href="#apply" className="button">Send an enquiry <LineIcon name="arrow" /></Link>
            <Link href="/loan-calculator" className="text-link">Estimate repayments <LineIcon name="arrow" /></Link>
          </div>
          <a className={styles.heroContact} href="tel:+6563339061"><LineIcon name="phone" /><span>Prefer a conversation? <strong>6333 9061</strong></span></a>
        </div>
        <div className={styles.heroPhoto}>
          <Image src="/photos/storefront-visit.jpg" alt="HMS Credit’s entrance at #01-08 Sim Lim Square" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
        </div>
      </div>
    </section>
    <TrustBar />
    <section className={styles.section} aria-labelledby="loans-heading">
      <div className={styles.sectionHead}>
        <h2 id="loans-heading">Loan options for<br />what you have in mind.</h2>
        <p>Start with the purpose of your loan. We’ll discuss the amount, documents and repayments with you before you decide.</p>
      </div>
      <LoanCards headingLevel={3} />
    </section>
    <section className={styles.enquirySection} aria-labelledby="enquiry-heading">
      <div className={styles.enquiryInner}>
        <div className={styles.process}>
          <h2 id="enquiry-heading">Your enquiry.<br />Our next conversation.</h2>
          <p>Leave a few details and our team will get in touch. Here’s what happens next.</p>
          <ol>
            <li><h3>Tell us what you need</h3><p>Share your contact details and the loan amount you have in mind.</p></li>
            <li><h3>Talk with our team</h3><p>We’ll discuss your circumstances and the documents needed for an assessment.</p></li>
            <li><h3>Meet us at the office</h3><p>Complete verification at Sim Lim Square and review the rate, fees and repayment schedule before signing.</p></li>
          </ol>
          <p className={styles.limit}>Sending an enquiry does not guarantee approval. Borrow only what you can afford to repay.</p>
        </div>
        <div className={styles.enquiryForm} id="apply">
          <h3>Send an enquiry</h3><p className={styles.formIntro}>Our team will contact you about your request.</p>
          <LeadForm />
          <div className={styles.singpass}><span>Or prefill an application with Myinfo</span><SingpassButton href="/apply" /></div>
        </div>
      </div>
    </section>
    <div className={styles.section}><VisitOffice /></div>
  </main>;
}
