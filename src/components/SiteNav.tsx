"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { LineIcon } from "./LineIcon";
const links = [["/loans", "Loans"], ["/loan-calculator", "Loan calculator"], ["/about", "About us"], ["/faq", "FAQ"], ["/contact", "Contact"]];
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <nav className="site-nav" aria-label="Main navigation" onKeyDown={event => { if(event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); } }}>
    <div className="site-nav-inner">
      <Link href="/" className="site-logo" onClick={() => setOpen(false)}><Image src="/logo-mark.png" alt="" width={57} height={32} priority className="site-logo-mark-img" />HMS Credit</Link>
      <button ref={toggle} type="button" className="nav-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}><LineIcon name={open ? "close" : "menu"}/><span>{open ? "Close" : "Menu"}</span></button>
      <div id="site-navigation" className={`site-nav-links${open ? " is-open" : ""}`}>
        {links.map(([href,label]) => <Link key={href} href={href} aria-current={pathname === href || (href === "/loans" && pathname.startsWith("/loans/")) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/apply" className="button button-navy site-nav-cta" onClick={() => setOpen(false)}>Apply now <LineIcon name="arrow"/></Link>
      </div>
    </div>
  </nav>;
}
