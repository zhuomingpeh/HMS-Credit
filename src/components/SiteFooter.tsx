import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-logo">
            <span className="site-logo-mark">$</span>
            HMS Credit
          </span>
          <p>
            Licensed moneylender approved by the Ministry of Law. #01-08 Sim Lim Square, 1 Rochor Canal Road, Singapore
            188504.
          </p>
        </div>

        <div className="site-footer-links">
          <div className="site-footer-col">
            <strong>Loans</strong>
            <Link href="/loans/personal-loan">Personal Loan</Link>
            <Link href="/loans/foreigner-loan">Foreigner Loan</Link>
            <Link href="/loans/wedding-loan">Wedding Loan</Link>
            <Link href="/loans/business-loan">Business Loan</Link>
            <Link href="/loans/education-loan">Education Loan</Link>
          </div>
          <div className="site-footer-col">
            <strong>Company</strong>
            <Link href="/about">About Us</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/loan-calculator">Loan Calculator</Link>
          </div>
          <div className="site-footer-col">
            <strong>Legal</strong>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <a href="https://rom.moneylenders.gov.sg/RomMoneylenders/" target="_blank" rel="noopener noreferrer">
              Ministry of Law Registry
            </a>
          </div>
          <div className="site-footer-col">
            <strong>Contact</strong>
            <a href="tel:+6563339061">+65 6333 9061</a>
            <a href="mailto:support@hmsmoney.com">support@hmsmoney.com</a>
            <span>Mon&ndash;Sat, 11am&ndash;7pm</span>
          </div>
        </div>
      </div>

      <p className="site-footer-disclosure">
        HMS Credit Pte Ltd is a licensed moneylender regulated by the Registry of Moneylenders, Ministry of Law,
        Singapore. Borrow only what you can afford to repay. For a full list of licensed moneylenders, visit the
        Ministry of Law&apos;s official registry.
      </p>
    </footer>
  );
}
