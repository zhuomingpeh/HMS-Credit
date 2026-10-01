import Link from "next/link";
import { fieldLabel, reviewSections } from "@/lib/singpass/reviewFields";
import { mapMyInfoToApplicant } from "@/lib/singpass/myinfo";
import { LOAN_TYPES } from "@/lib/loans";
import { AddressEmployment, HdbDetails } from "../apply/review/PropertyDetails";
import { FinancialHistory } from "../apply/review/FinancialHistory";

type ApplicationRecord = {
  name: string; loanAmount: number | null; loanType: string | null; createdAt: Date;
  status: string; phone: string | null; email: string | null; residency: string;
  kind: "applicant" | "lead"; isTest?: boolean; personInfo?: Record<string, unknown>;
};
const submittedDate = new Intl.DateTimeFormat("en-SG", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Singapore",
});

export default function ApplicationDetail({ record }: { record: ApplicationRecord }) {
  const info = record.personInfo ?? {};
  const sections = reviewSections(info);
  const originalContact = mapMyInfoToApplicant(info);
  const amount = record.loanAmount == null ? "Not provided" : `S$${record.loanAmount.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const loan = LOAN_TYPES.find(loan => loan.slug === record.loanType || loan.name === record.loanType)?.name ?? record.loanType ?? "Not specified";
  const status = record.status.charAt(0) + record.status.slice(1).toLowerCase();
  return <main id="main-content" className="page page-wide compact-review staff-detail-page">
    <Link className="staff-detail-back" href="/staff">← Back to applications</Link>
    <header className="staff-detail-header">
      <div><div className="staff-detail-badges"><span className="staff-badge">{record.kind === "applicant" ? "Myinfo application" : "Manual enquiry"}</span><span className="staff-badge staff-badge-manual">{status}</span>{record.isTest && <span className="staff-badge staff-badge-test">Test application</span>}</div>
        <h1>{record.name}</h1><p className="review-caption">Submitted <time dateTime={record.createdAt.toISOString()}>{submittedDate.format(record.createdAt)}</time> · Singapore time</p>
      </div>
      <div className="staff-request-amount"><span>Requested loan amount</span><strong>{amount}</strong><small>Applicant&apos;s request · not an approved amount</small></div>
    </header>
    {record.isTest && <aside className="staff-staging"><p>This record was submitted using Singpass staging.</p></aside>}
    <section className="card" id="contact-details"><h2>Loan and contact details</h2><dl className="review-grid staff-detail-grid">
      <div><dt>Mobile number</dt><dd>{record.phone || "Not provided"}</dd></div>
      <div><dt>Email</dt><dd>{record.email || "Not provided"}</dd></div>
      <div><dt>Loan type</dt><dd>{loan}</dd></div>
      {record.kind === "lead" && <div><dt>Residency</dt><dd>{record.residency === "SG_PR" ? "Singaporean / PR" : "Foreigner"}</dd></div>}
    </dl><p className="review-caption">Use these submitted contact details for follow-up.</p></section>
    {record.kind === "applicant" && <>
      <nav className="staff-detail-jumps" aria-label="Application sections"><a href="#personal-details">Personal details</a><a href="#address-details">Address & employment</a><a href="#property-details">HDB ownership</a><a href="#financial-details">CPF & income</a></nav>
      {[
        { id: "personal-details", title: "Personal details", keys: ["uinfin", "name", "sex", "race", "dob", "residentialstatus", "nationality", "marital"] },
        { id: "pass-details", title: "Pass details", keys: ["passtype", "passstatus", "passexpirydate"] },
      ].map(group => <section className="card" id={group.id} key={group.id}><h2>{group.title}</h2><dl className="review-grid staff-detail-grid">
        {group.keys.flatMap(key => sections.filter(section => section.key === key)).flatMap(({key, fields}) => fields.map((field, i) => <div key={`${field.path}-${i}`}><dt>{field.label || fieldLabel(key)}</dt><dd>{field.value || "Not provided"}</dd></div>))}
      </dl></section>)}
      <div id="address-details"><AddressEmployment info={info} readOnly /></div>
      <div id="property-details"><HdbDetails info={info} readOnly /></div>
      <div id="financial-details"><FinancialHistory info={info} readOnly /></div>
      <details className="card staff-original-contact"><summary>Original contact details retrieved from Myinfo</summary><dl className="review-grid staff-detail-grid"><div><dt>Mobile number</dt><dd>{originalContact.mobileNumber || "Not provided"}</dd></div><div><dt>Email</dt><dd>{originalContact.email || "Not provided"}</dd></div></dl></details>
    </>}
    <p className="staff-list-note">Application submission and identity verification do not constitute loan approval.</p>
  </main>;
}
