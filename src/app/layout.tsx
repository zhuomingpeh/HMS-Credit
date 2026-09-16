import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const headingFont = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hmsmoney.com"),
  title: {
    default: "HMS Credit | Licensed Moneylender in Singapore",
    template: "%s | HMS Credit",
  },
  description:
    "HMS Credit is a licensed moneylender in Singapore offering personal, wedding, business, foreigner and education loans. Visit us at Sim Lim Square or apply online.",
  icons: {
    icon: "/favicon.webp",
  },
  openGraph: {
    title: "HMS Credit | Licensed Moneylender in Singapore",
    description: "Reliable & trusted licensed moneylender at Sim Lim Square. Personal, wedding, business, foreigner and education loans.",
    url: "https://hmsmoney.com",
    siteName: "HMS Credit",
    locale: "en_SG",
    type: "website",
  },
};

// Static — no user input — safe to inline via dangerouslySetInnerHTML.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "HMS Credit",
  legalName: "HMS CREDIT PTE. LTD.",
  url: "https://hmsmoney.com",
  telephone: "+65 6333 9061",
  email: "support@hmsmoney.com",
  identifier: [
    { "@type": "PropertyValue", name: "UEN", value: "201703408D" },
    { "@type": "PropertyValue", name: "Moneylender's Licence No.", value: "91/2026" },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "1 Rochor Canal Road, #01-08 Sim Lim Square",
    addressLocality: "Singapore",
    postalCode: "188504",
    addressCountry: "SG",
  },
  openingHours: "Mo-Sa 11:00-19:00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
