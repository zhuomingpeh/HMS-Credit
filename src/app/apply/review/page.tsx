import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readDraft } from "@/lib/singpass/drafts";
import { fieldLabel, reviewSections, MARITAL_STATUSES } from "@/lib/singpass/reviewFields";
import { mapMyInfoToApplicant } from "@/lib/singpass/myinfo";
import { AddressEmployment, HdbDetails } from "./PropertyDetails";
import { SubmitReviewButton } from "./SubmitReviewButton";
import { FinancialHistory } from "./FinancialHistory";
import { cancelApplication, submitReviewedApplication } from "./actions";

export const metadata: Metadata = { title: "Review Your Application", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const draft = await readDraft();
  if (!draft) redirect("/apply?reviewError=session");
  const error = (await searchParams).error;
  const info = structuredClone(draft.data.personInfo);
  const mapped = mapMyInfoToApplicant(info);
  const sections = reviewSections(info);
  return <main id="main-content" className="page page-wide compact-review">
    <h1>Review your application</h1>
    <p className="review-caption">Check your details, then submit. You can edit your marital status, mobile number and email. Other government-verified details are read-only.</p>
    <p className="review-caption">For your privacy, this review expires after 15 minutes.</p>
    {error && <p role="alert" className="error-banner">Check your loan amount, editable details and consent before submitting.</p>}
    <form action={submitReviewedApplication}>
      <section className="card"><h2>Loan and contact details</h2>
        <div className="review-grid">
          <div><label htmlFor="reviewAmount">Loan amount (S$)</label><input id="reviewAmount" name="loanAmount" type="text" inputMode="numeric" pattern="[0-9]{1,7}" maxLength={7} title="Enter a whole dollar amount from 1 to 1000000" required defaultValue={draft.data.loanAmount} /></div>
          <div><label htmlFor="contactMobile">Mobile number</label><input id="contactMobile" name="contactMobile" type="tel" autoComplete="tel" required defaultValue={mapped.mobileNumber ?? ""} maxLength={30} /></div>
          <div><label htmlFor="contactEmail">Email</label><input id="contactEmail" name="contactEmail" type="email" autoComplete="email" required defaultValue={mapped.email ?? ""} maxLength={254} /></div>
        </div>
        {sections.filter(s => ["mobileno", "email"].includes(s.key)).flatMap(s => s.fields.filter(f => f.editable)).map(f => <input key={f.path} type="hidden" name={`myinfo:${f.path}`} value={f.value} />)}
      </section>
      {[
        { title: "Personal details", keys: ["uinfin", "name", "sex", "race", "dob", "residentialstatus", "nationality", "marital"] },
        { title: "Pass details", keys: ["passtype", "passstatus", "passexpirydate"] },
      ].map(group => <section className="card" key={group.title}><h2>{group.title}</h2><div className="review-grid">
        {group.keys.flatMap(key => sections.filter(s => s.key === key)).flatMap(({key, fields}) => fields.map((field, i) => <div className="review-detail" key={`${field.path}-${i}`}>
          <label htmlFor={`field-${field.path}`}>{field.label || fieldLabel(key)}</label>
          {key === "marital" ? <select id={`field-${field.path}`} name={`myinfo:${field.path}`} defaultValue={field.value}>
            <option value="">Select marital status</option>
            {field.value && !MARITAL_STATUSES.includes(field.value as typeof MARITAL_STATUSES[number]) && <option value={field.value}>{field.value}</option>}
            {MARITAL_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select> : field.editable ? <input id={`field-${field.path}`} name={`myinfo:${field.path}`} defaultValue={field.value} maxLength={500} /> : <div className="review-readonly">{field.value || "Not provided"}</div>}
        </div>))}
      </div></section>)}
      <AddressEmployment info={info} />
      <HdbDetails info={info} />
      <FinancialHistory info={info} />
      <section className="card">
        <label className="review-consent"><input name="consent" type="checkbox" value="yes" required />
          <span>I have reviewed my details and consent to HMS CREDIT PTE. LTD. using them to assess and contact me about this loan application, as described in the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. Submission does not guarantee loan approval.</span>
        </label>
        <SubmitReviewButton />
      </section>
    </form>
    <form action={cancelApplication}><button className="button review-cancel" type="submit">Cancel and delete these details</button></form>
  </main>;
}
