"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitLead, type LeadFormState } from "@/lib/actions/lead";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="button" disabled={pending} style={{ width: "100%" }}>
      {pending ? "Submitting…" : "Submit"}
    </button>
  );
}

const initialState: LeadFormState = { ok: false };

export function LeadForm({ loanType }: { loanType?: string }) {
  const [state, action] = useActionState<LeadFormState, FormData>(submitLead, initialState);

  if (state.ok) {
    return (
      <div className="submission-done">
        <div className="submission-done-icon">✓</div>
        <h2>Thanks — we&apos;ve got your details</h2>
        <p>Our team will call or WhatsApp you shortly. You can also reach us directly at +65 6333 9061.</p>
      </div>
    );
  }

  return (
    <form action={action}>
      {state.error && <div className="error-banner">{state.error}</div>}
      {loanType && <input type="hidden" name="loanType" value={loanType} />}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="9123 4567" />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="field">
        <label>Residency status</label>
        <div className="radio-row">
          <label className="radio-option">
            <input type="radio" name="residency" value="SG_PR" required /> Singaporean/PR
          </label>
          <label className="radio-option">
            <input type="radio" name="residency" value="FOREIGNER" /> Foreigner
          </label>
        </div>
      </div>

      <div className="field">
        <label htmlFor="loanAmount">Loan amount</label>
        <input id="loanAmount" name="loanAmount" type="number" min={500} step={100} required placeholder="$" />
      </div>

      <SubmitButton />
    </form>
  );
}
