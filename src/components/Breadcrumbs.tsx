import Link from "next/link";
import { JsonLd } from "./JsonLd";
export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const trail = [{ name: "Home", href: "/" }, ...items];
  return <><nav aria-label="Breadcrumb" className="breadcrumbs"><ol>{trail.map((item, i) => <li key={item.href}>{i === trail.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.href}>{item.name}</Link>}</li>)}</ol></nav>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `https://hmsmoney.com${item.href}` })) }} />
  </>;
}
