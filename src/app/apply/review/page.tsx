import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readDraft } from "@/lib/singpass/drafts";
import { fieldLabel, reviewSections } from "@/lib/singpass/reviewFields";
import { cancelApplication, submitReviewedApplication } from "./actions";

export const metadata: Metadata = { title: "Review Your Application", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const draft = await readDraft();
  if (!draft) redirect("/apply?singpassError=1");
  const error = (await searchParams).error;
  const info = structuredClone(draft.data.personInfo);
  return <main className="page page-wide">
    <h1>Review your application</h1>
    <p>Your Myinfo details are shown below. Government-verified fields cannot be edited here; contact the source agency if they need correction. You can edit user-provided fields.</p>
    <p>This review expires after 15 minutes. Your application is only submitted when you select “Submit application”.</p>
    {error && <p role="alert" className="error-banner">Check your loan amount, editable details and consent before submitting.</p>}
    <form action={submitReviewedApplication}>
      <section className="card"><h2>Loan request</h2><label htmlFor="reviewAmount">Loan amount (S$)</label>
        <input id="reviewAmount" name="loanAmount" type="number" min="1" max="1000000" step="1" required defaultValue={draft.data.loanAmount} />
      </section>
      {reviewSections(info).map(({key, fields}) => <section className="card myinfo-section" key={key}>
        <h2>{fieldLabel(key)}</h2>
        {key === "cpfcontributions" && <p>Employment-related contributions only, ordered by paid-on date and contribution month.</p>}
        {fields.map((field, i) => <div className="myinfo-field" key={`${field.path}-${i}`}>
          <label htmlFor={`field-${field.path}`}>{field.label || fieldLabel(key)}</label>
          {field.editable ? <input id={`field-${field.path}`} name={`myinfo:${field.path}`} defaultValue={field.value} maxLength={500} /> : <div className="myinfo-value">{field.value || "Not provided"}</div>}
          {field.source && <small>{field.source === "2" ? (field.editable ? "User-provided — editable" : "User-provided — read only") : field.source === "1" || field.source === "4" ? "Verified at source" : "Source data"}</small>}
        </div>)}
      </section>)}
      <section className="card">
        <label className="review-consent"><input name="consent" type="checkbox" value="yes" required />
          <span>I have reviewed my details and consent to HMS CREDIT PTE. LTD. using them to assess and contact me about this loan application, as described in the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. Submission does not guarantee loan approval.</span>
        </label>
        <button className="button" type="submit">Submit application</button>
      </section>
    </form>
    <form action={cancelApplication}><button className="button secondary" type="submit">Cancel and delete these details</button></form>
  </main>;
}
