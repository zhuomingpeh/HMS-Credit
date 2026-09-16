import type { MetadataRoute } from "next";
import { LOAN_TYPES } from "@/lib/loans";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hmsmoney.com";
  const staticRoutes = ["", "/loans", "/loan-calculator", "/about", "/faq", "/contact", "/privacy", "/terms"];

  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() })),
    ...LOAN_TYPES.map((loan) => ({ url: `${base}/loans/${loan.slug}`, lastModified: new Date() })),
  ];
}
