import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for the HMS Credit website.",
};

export default function TermsPage() {
  return (
    <main className="page legal-page">
      <h1>Terms of Service</h1>
      <p className="subtitle">Please read these terms before using this website or submitting a loan enquiry.</p>

      <h2>About this website</h2>
      <p>
        This website is operated by HMS Credit Pte Ltd, a moneylender licensed by the Registry of Moneylenders,
        Ministry of Law, Singapore. Submitting an enquiry through this website does not constitute a loan
        application or a guarantee of approval — it allows our team to contact you to discuss your loan needs.
      </p>

      <h2>Loan terms</h2>
      <p>
        All loans are subject to assessment and approval at our discretion, and to the requirements of the
        Moneylenders Act and its subsidiary legislation, including caps on interest, fees, and total borrowing
        cost. Final loan terms are set out in the loan contract you sign in person at our office.
      </p>

      <h2>Website use</h2>
      <p>
        You agree to provide accurate information when using this website. You must not use this website for any
        unlawful purpose or attempt to gain unauthorised access to our systems.
      </p>

      <h2>No investment or financial advice</h2>
      <p>
        Content on this website, including the loan calculator, is for general information and illustration only.
        It is not financial advice, and it is not a quotation of the rate or terms you will be offered.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, HMS Credit is not liable for any loss arising from your use of this website,
        except where that loss results from our negligence or breach of a legal obligation that cannot be excluded.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these terms can be sent to <a href="mailto:support@hmsmoney.com">support@hmsmoney.com</a>.
      </p>

      <p className="legal-disclaimer">Last updated: September 2026.</p>
    </main>
  );
}
