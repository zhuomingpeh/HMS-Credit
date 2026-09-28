import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: { title: "Privacy Policy | HMS Credit", description: "How HMS Credit collects, uses, and protects borrower information.", url: "https://hmsmoney.com/privacy", images: ["/photos/storefront-entrance.jpg"] },
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy",
  description: "How HMS Credit collects, uses, and protects borrower information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="page legal-page">
      <h1>Privacy Policy</h1>
      <p className="subtitle">
        HMS Credit uses borrower information to assess loan enquiries, process applications, and stay in touch about
        your loan.
      </p>

      <h2>Company details</h2>
      <p>
        HMS CREDIT PTE. LTD.
        <br />
        UEN: 201703408D
        <br />
        Moneylender&apos;s Licence No.: 91/2026
        <br />
        Registered Address: #01-08 Sim Lim Square, 1 Rochor Canal Road, Singapore 188504
      </p>

      <h2>Information we collect</h2>
      <p>
        Name, contact number, email address, residency status, requested loan amount, and — where you apply in
        person or provide supporting documents — income and identity documents required under the Moneylenders Act
        and its regulations.
      </p>

      <h2>How we use your information</h2>
      <p>
        If you choose Myinfo, and consent through Singpass, we retrieve the identity, contact,
        residence, employment, income, CPF, property and vehicle information listed on the
        Singpass consent screen for your loan application. You can review the retrieved details
        before submission, or use our manual enquiry form instead.
      </p>
      <p>
        Myinfo review data is temporarily encrypted and expires after 15 minutes. Cancelling
        deletes that temporary data immediately. Expired, unsubmitted data is deleted by our
        daily cleanup and when new reviews are created. Submitted applications are retained
        only for the application purpose and applicable record-keeping obligations.
      </p>
      <p>
        We use your information to respond to loan enquiries, assess eligibility, verify your identity, communicate
        with you about your application, comply with our obligations as a licensed moneylender, and improve our
        service.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We may share relevant information with the Ministry of Law and
        other government agencies as required by law, and with service providers who help us operate our business
        (for example, hosting and communications providers) under appropriate confidentiality obligations.
      </p>

      <h2>Retention and protection</h2>
      <p>
        We retain your information for as long as necessary for the purposes above, for our records as a licensed
        moneylender, and to meet legal and regulatory requirements. We take reasonable technical and organisational
        measures to protect your information from unauthorised access, loss, or misuse.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the Personal Data Protection Act, you may request access to or correction of your personal data, or
        withdraw consent for us to use it (subject to legal and contractual restrictions). Contact us at{" "}
        <a href="mailto:support@hmsmoney.com">support@hmsmoney.com</a> to make a request.
      </p>

      <h2>Contact us</h2>
      <p>
        For any questions about this policy, email <a href="mailto:support@hmsmoney.com">support@hmsmoney.com</a> or
        call +65 6333 9061.
      </p>

      <p className="legal-disclaimer">Last updated: September 2026.</p>
    </main>
  );
}
