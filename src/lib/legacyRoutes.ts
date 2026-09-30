// Exact predecessors observed in HMS's Search Console indexed-page report on
// 30 Sep 2026. Do not redirect removed articles/tags to unrelated loan pages.
export const LEGACY_ROUTES: Record<string, string> = {
  "/hms-credit-personal-loan": "/loans/personal-loan",
  "/hms-credit-wedding-loan": "/loans/wedding-loan",
  "/hms-credit-repayment-calculator": "/loan-calculator",
  "/aboutus": "/about",
  "/contactus": "/contact",
  "/hms-credit-faq-singapore": "/faq",
  "/get-in-touch-hms-credit-money-lender-singapore-vcf-download": "/contact",
};
