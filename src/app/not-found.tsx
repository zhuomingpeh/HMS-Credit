import Link from "next/link";
import { LineIcon } from "@/components/LineIcon";
export default function NotFound() {
  return <main id="main-content" className="page"><span className="eyebrow">Page not found</span><h1>Let’s get you back on track.</h1><p className="subtitle">This page may have moved or the address may be incorrect. Explore our loan options or contact our team for help.</p><div className="action-row"><Link className="button" href="/loans">Explore loans <LineIcon name="arrow"/></Link><Link className="text-link" href="/contact">Contact us</Link></div></main>;
}
