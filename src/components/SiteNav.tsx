import Image from "next/image";
import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-logo">
          <Image src="/logo-mark.png" alt="HMS Credit" width={57} height={32} priority className="site-logo-mark-img" />
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
