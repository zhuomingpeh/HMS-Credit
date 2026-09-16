import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-logo">
          <span className="site-logo-mark">$</span>
          HMS Credit
        </Link>
        <div className="site-nav-links">
          <Link href="/loans">Loans</Link>
          <Link href="/loan-calculator">Loan Calculator</Link>
          <Link href="/about">About Us</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/contact#apply" className="button button-navy site-nav-cta">
            Apply Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
