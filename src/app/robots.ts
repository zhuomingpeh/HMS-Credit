import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/staff", "/api/", "/apply/review", "/apply/success"] },
    sitemap: "https://hmsmoney.com/sitemap.xml",
  };
}
