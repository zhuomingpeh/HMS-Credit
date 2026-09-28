import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readDraft } from "@/lib/singpass/drafts";
import { fieldLabel, reviewSections } from "@/lib/singpass/reviewFields";
import { mapMyInfoToApplicant } from "@/lib/singpass/myinfo";
import { AddressEmployment, HdbDetails } from "./PropertyDetails";
import { FinancialHistory } from "./FinancialHistory";
import { cancelApplication, submitReviewedApplication } from "./actions";

export const metadata: Metadata = { title: "Review Your Application", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const draft = await readDraft();
  if (!draft) redirect("/apply?singpassError=1");
  const error = (await searchParams).error;
  const info = structuredClone(draft.data.personInfo);
  const mapped = mapMyInfoToApplicant(info);
  const sections = reviewSections(info);
  return <main className="page page-wide compact-review">
    <h1>Review your application</h1>
    <p>Your Myinfo details are shown below. Government-verified fields cannot be edited here; contact the source agency if they need correction. You can edit user-provided fields.</p>
    <p>This review expires after 15 minutes. Your application is only submitted when you select “Submit application”.</p>
    {error && <p role="alert" className="error-banner">Check your loan amount, editable details and consent before submitting.</p>}
    <form action={submitReviewedApplication}>
      <section className="card"><h2>Loan and contact details</h2>
        <div className="review-grid">
          <div><label htmlFor="reviewAmount">Loan amount (S$)</label><input id="reviewAmount" name="loanAmount" type="number" min="1" max="1000000" step="1" required defaultValue={draft.data.loanAmount} /></div>
          <div><label htmlFor="contactMobile">Mobile number</label><input id="contactMobile" name="contactMobile" type="tel" autoComplete="tel" required defaultValue={mapped.mobileNumber ?? ""} maxLength={30} /></div>
          <div><label htmlFor="contactEmail">Email</label><input id="contactEmail" name="contactEmail" type="email" autoComplete="email" required defaultValue={mapped.email ?? ""} maxLength={254} /></div>
        </div>
        {sections.filter(s => ["mobileno", "email"].includes(s.key)).flatMap(s => s.fields.filter(f => f.editable)).map(f => <input key={f.path} type="hidden" name={`myinfo:${f.path}`} value={f.value} />)}
      </section>
      {[
        { title: "Personal details", keys: ["uinfin", "name", "sex", "race", "dob", "marital", "residentialstatus", "nationality", "passtype", "passstatus", "passexpirydate"] },
      ].map(group => <section className="card" key={group.title}><h2>{group.title}</h2><div className="review-grid">
        {sections.filter(s => group.keys.includes(s.key)).flatMap(({key, fields}) => fields.map((field, i) => <div className="review-detail" key={`${field.path}-${i}`}>
          <label htmlFor={`field-${field.path}`}>{field.label || fieldLabel(key)}</label>
          {field.editable ? <input id={`field-${field.path}`} name={`myinfo:${field.path}`} defaultValue={field.value} maxLength={500} /> : <div className="review-readonly">{field.value || "Not provided"}</div>}
        </div>))}
      </div></section>)}
      <AddressEmployment info={info} />
      <HdbDetails info={info} />
      <FinancialHistory info={info} />
      <section className="card">
        <label className="review-consent"><input name="consent" type="checkbox" value="yes" required />
          <span>I have reviewed my details and consent to HMS CREDIT PTE. LTD. using them to assess and contact me about this loan application, as described in the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. Submission does not guarantee loan approval.</span>
        </label>
        <button className="button" type="submit">Submit application</button>
      </section>
    </form>
    <form action={cancelApplication}><button className="button review-cancel" type="submit">Cancel and delete these details</button></form>
  </main>;
}
